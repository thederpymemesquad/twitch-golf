//var nick = 'TheDerpyMemeBot',
//    auth = 'oauth:rnv4lfesmhfw22jhqqlolhlzkuw07i',
//    channel = 'leotomas';

var twitchOauthData = {
    "access_token": null,
    "scope": [],
    "user": {
        "login": "",
        "id": "",
        "display": ""
    },
    "token_type": null,
    "channel_to_join": "",
    "readyToJoinChat": false
};

window.onmessage = function(event){
    //logSystemMessage(event.data);
    if (event.data.startsWith("twitchOauth")) {
        //logSystemMessage(event.data);
        var dataString = event.data.split('#', 2)[1]
        //console.log(typeof(event.data))
        //console.log(event.data.split('#',2))
        var data = {};

        var dataEntries = dataString.split("&");
        for (var ent in dataEntries) {
            var entName = dataEntries[ent].split('=')[0];
            var entValue = dataEntries[ent].split('=', 2)[1]
            //console.log(entName + ":" + entValue)
            data[entName] = entValue
        }
        //console.log(data)
        twitchOauthData = data;
        tch = data['channel_to_join']

        //twitchUserData = getJson("https://api.twitch.tv/helix/users?" + "")

        var a = fetch("https://api.twitch.tv/helix/users",
            {
                headers: {
                    Authorization: 'Bearer ' + twitchOauthData['access_token']
                }
            }
        ).then(function(c) {
            return c.json()
        }).then(function(j) {
            console.log(j)
            twitchOauthData['user'] = {"login": j['data'][0]['login'], "id": j['data'][0]['id'], "display": j['data'][0]['display_name']}
            twitchOauthData["readyToJoinChat"] = true;
        }).catch(function(err) {
            logSystemMessage('e ' + err);
        });

        //console.log(a)

        setTimeout(setupBot, 1000);
        
    }
}

function generateTwitchOauthURL() {
    var url = "https://id.twitch.tv/oauth2/authorize";
    url += "?client_id=9yyejeel2lb0vfny41fs535r1jesg2"
    url += "&redirect_uri=https://leotomasmc.github.io/ssbu-music-player/auth.html";
    url += "&response_type=token";
    url += "&force_verify=true";
    url += "&scope=chat:edit%20chat:read%20channel:read:subscriptions%20whispers:edit";
    return url;
}

function beginTwitchOauthFlow() {
    //var url = "https://id.twitch.tv/oauth2/authorize?client_id=9yyejeel2lb0vfny41fs535r1jesg2&redirect_uri=https://leotomasmc.github.io/ssbu-music-player/auth.html&response_type=token&force_verify=true";
    var title = "Twitch OAuth 2.0 Authentication";
    oauth = window.open(generateTwitchOauthURL(), title, "frame=yes,autoHideMenuBar=yes");
    //oauth = window.open("file:///Z:/development/projects/gh/ssbu-music-player/auth.html#access_token=exampleToken12345&scope=chat%3Aedit+chat%3Aread+channel%3Aread%3Asubscriptions+whispers%3Aedit&token_type=bearer", title, "frame=yes,autoHideMenuBar=yes");
}

function setupBot() {
    var client = new tmi.client({
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: twitchOauthData['user']['login'],
            password: "oauth:" + twitchOauthData['access_token']
        },
        channels: [twitchOauthData['channel_to_join']]
    });
    
    client.on('message', (channel, tags, message, self) => {
        logBasicChatMessage(tags['display-name'], tags.color, message, tags.emotes)
        console.log(tags)
        if(self) {
            return false;
        }
        console.log(message)
        if (message.startsWith("!level")) {
            var msg = "Current Level: " + currentLevelMeta['name'] + " by " + currentLevelMeta['author']
            client.say(channel, msg)
        } else if (message.startsWith("2+2=9")) {

        } else if (message.startswith("")) {
            
        }
    });
    client.connect();
}