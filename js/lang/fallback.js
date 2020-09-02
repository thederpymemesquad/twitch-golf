/*  
    this entire file is a backup for if the game is unable to 
    load json files for whatever reason, it will mostly just 
    be the same as en_us
*/
    
lang_finalFallback = {
    "lang": {
        "name": "English (US) (fallback)",
        "ver": "0.1.0",
        "author": "LeOtOmAs",
        "id": "en_us"
    },
    "game": {
        "info": {
            "lang": "Language",
            "langchange": "Click to change",
            "level": "Level",
            "name": "Twitch Golf",
            "ver": "Version",
            "build": "Build"
        }
    },
    "editor": {
        "ui": {
            "menu": {
                "button": {
                    "text": "Level Editor Menu",
                    "hover": "Opens the level editor tools menu<br>Yes, level editor"
                },
                "delete": {
                    "text": "Delete Objects: ",
                    "hover": "Will remove objects from the level instead of placing them"
                },
                "object": {
                    "types": {
                        "ball": "Place Ball",
                        "hole": "Place Hole",
                        "rect": "Rectangle",
                        "circle": "Circle",
                        "trap": "Trapezoid",
                        "regpoly": "Regular Polygon",
                        "poly": "Polygon",
                        "tri": "Triangle"
                    },
                    "static": {
                        "text": "Is Static: ",
                        "hover": "This option will make the object never move"
                    },
                    "sides": {
                        "text": "Sides: ",
                        "hover": "This option is the number of sides for regular polygons, and the maxsides property of circles if enabed. Doesnt apply to other shapes",
                        "circle": "Enable this to make sides option apply to circles. <b>Not reccommended</b>"
                    }
                },
                "composite": {
                    "composite": {
                        "text": "Composite Options: ",
                        "hover": "Composites are groups of objects, they will all have the same properties, but they can be placed in bulk patterns, such as pyramids or grids"
                    },
                    "place": "Place Composites: ",
                    "type": "Composite Type: ",
                    "types": {
                        "pyramid": "Pyramid",
                        "stack": "Stack"
                    },
                    "chain": {
                        "text": "Chain Objects: ",
                        "hover": "This option will connect all objects with a constraint, making a chain"
                    },
                    "size": {
                        "cols": "Columns",
                        "rows": "Rows",
                        "colgap": "Column Gap",
                        "rowgap": "Row Gap"
                    }
                },
                "data": {
                    "title": "Level Data",
                    "import": "Import Level JSON",
                    "import-desc": "Imports a level using JSON data previously exported by the Export button.",
                    "export": "Export Level JSON",
                    "export-desc": "Exports level JSON data to be loaded later using the import box"
                }
            },
            "enable": "Enable Editor: ",
            "shortcut": "Shortcut to toggle the editor on and off"
        }
    },
    "debug": {
        "menu": {
            "button": {
                "text": "Debug Menu",
                "hover": "Opens the debug menu, to enable various testing tools"
            },
            "enable": "Enable debug mode",
            "disable": "Disable debug mode",
            "info": "Debug info sidebar",
            "render": {
                "cameratarget": "Show camera target",
                "enable": "Enable debug render options",
                "wireframes": "Show wireframes",
                "sleeping": "Show sleeping bodies",
                "debug": "Show render debug info",
                "broadphase": "Show broadphase",
                "bounds": "Show renderer bounds",
                "velocity": "Show body velocities",
                "collisions": "Show body collisions",
                "separations": "Show body separations",
                "axes": "Show body axes",
                "positions": "Show body positions",
                "angles": "Show body angles",
                "ids": "Show body ids",
                "shadows": "Draw shadows",
                "vertexs": "show vertexes",
                "convexhulls": "convexhulls",
                "internaledges": "internaledges"
            }
        }
    },
    "chat": {
        "firstline": "Chat - Go to debug > twitch to test chat integration",
        "zoom": {
            "in": "Zoom In",
            "out": "Zoom Out",
            "reset": "Reset Zoom"
        },
        "toggle": "Toggle Chat",
        "badges": {
            "mod": "Mod",
            "sub": "Sub",
            "bc": "Streamer",
            "tp": "Prime",
            "tt": "Turbo",
            "glhf": "GLHF",
            "staff": "Staff",
            "founder": "Fndr",
            "vip": "VIP"
        }
    }
}