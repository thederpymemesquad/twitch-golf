function logBasicChatMessage(name, nameColor, message, emotes) {
    var c = document.getElementById('chat-area');

    c.innerHTML = c.innerHTML + "<div class='n-msg'><span style='color: " + nameColor + "'>" + name + "</span>: <span class='chat-message-content'>" + formatEmotes(message, emotes) + "</span></div>"
    c.scrollTop = c.scrollHeight;
}

function badges(chan, user, isBot) {
	
	function newBadge(text, color) {
		return "<div style='color=" + color + "'>" + text + "</div> ";
	}

	var badges = ""
	
	var chatBadges = document.createElement('span');
	chatBadges.className = 'chat-badges';
	
	if(!isBot) {
		if(user.username == chan) {
			chatBadges.appendChild(createBadge('broadcaster'));
		}
		if(user['user-type']) {
			chatBadges.appendChild(createBadge(user['user-type']));
		}
		if(user.turbo) {
			chatBadges.appendChild(createBadge('turbo'));
		}
	}
	else {
		chatChages.appendChild(createBadge('bot'));
	}
	
	return badges;
}

function htmlEntities(html) {
	function it() {
		return html.map(function(n, i, arr) {
				if(n.length == 1) {
					return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
						    return '&#'+i.charCodeAt(0)+';';
						});
				}
				return n;
			});
	}
	var isArray = Array.isArray(html);
	if(!isArray) {
		html = html.split('');
	}
	html = it(html);
	if(!isArray) html = html.join('');
	return html;
}


function formatEmotes(text, emotes) {
	var splitText = text.split('');
	for(var i in emotes) {
		var e = emotes[i];
		for(var j in e) {
			var mote = e[j];
			if(typeof mote == 'string') {
				mote = mote.split('-');
				mote = [parseInt(mote[0]), parseInt(mote[1])];
				var length =  mote[1] - mote[0],
					empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
				splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
				splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
			}
		}
	}
	return htmlEntities(splitText).join('')
}

function logSystemMessage(msg) {
    var c = document.getElementById('chat-area');

    c.innerHTML += "<div class='sys-msg'><span style='color: #aaa'>[Game Message] </span>" + msg + "</div>"
    c.scrollTop = c.scrollHeight;
}

function logRawText(text) {
    var c = document.getElementById('chat-area')

    c.innerHTML += "<div class='raw-msg'>" + text + "</div>";
    c.scrollTop = c.scrollHeight;
} 

function toggleChatVisible() {
    var cb = document.getElementById('chat-box')
    if (cb.classList.contains('hidden')) {
        cb.classList.remove('hidden');
    } else {
        cb.classList.add('hidden')
    }
    
}