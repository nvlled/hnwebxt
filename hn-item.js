var container =  document.body;
var hnmainTbody =  document.querySelector("table#hnmain table.comment-tree > tbody");
var IMG_W = 40;

// getAncestorNode(node, 1) == node.parentNode
// getAncestorNode(node, 2) == node.parentNode.parentNode
function getAncestorNode(node, generation) {
    if (!node)
        return null;
    for (var g = generation; g > 0; g--) {
        if (!node.parentNode)
            return null;
        node = node.parentNode;
    }
    return node;
}

// overwrites all entries on dest
// from obj
// mutates dest
function merge(dest, obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        dest[k] = obj[k];
    }
    return keys;
}

//--------------------------

// I'm still in the process of figuring
// how to embed css files from this folder
// into the web pages (that I don't own).
var cssText = 
    ".popup span {"+
    "   color: black;"+
    "}"+
    ".popup a {"+
    "   color: blue;"+
    "}"+
    ".popup {"+
    "   background-color: f6f6ef;"+
    "   position: fixed;"+
    "   border: 3px solid #900;"+
    "   top: 10px;"+
    "   padding: 10px;"+
    "   overflow: scroll;"+
    "   height: 90%;"+
    "   width: 85%;"+
    "}"+
    "";

var popupHeaderText = 
    "<div class='header'>"+
    "<button>close</button>"
    "</div>"+
    "";

function insertCss() {
    var style = document.createElement("style");
    style.textContent = cssText;
    document.head.appendChild(style);
}

//--------------------------


// a mapping from id to item node
var items = {};
var parents = {};

function listAllItems(level) {
    return hnmainTbody.querySelectorAll("tr.athing.comtr");
}

function randomItem() {
    var items = hnmainTbody.children;
    var len = items.length;
    var i = Math.floor((Math.random() * len));
    return items[i];
}

function getItem(id) {
    // selectors such as #12345 isn't
    // valid, so I can't query them directly.
    var upvoteLink = hnmainTbody.querySelector("#up_"+id);
    var magic = 7;
    return getAncestorNode(upvoteLink, magic);
}

function getItemId(item) {
    return node.id;
}

function getParentItem(item) {
    if (parents[item.id])
        return parents[item.id];

    var lvl = getLevel(item);
    if (lvl == 0)
        return null;

    var prevNode = item.previousElementSibling;
    while (prevNode) {
        if (lvl == getLevel(prevNode)+1) {
            parents[item.id] = prevNode;
            return prevNode;
        }

        prevNode = prevNode.previousElementSibling;
    }
    return null;
}

function getLevel(item) {
    var width = +item.querySelector(".ind > img").getAttribute("width");
    return (width/IMG_W);
}

function getLineThread(item) {
    var thread = [];
    while (item) {
        thread.unshift(item);
        item = getParentItem(item);
    }
    return thread;
}

function removeIndent(item) {
    item.querySelector(".ind > img").width = 0;
}

function showLineThread(item) {

    function removeTrLink(item) {
        var link = item.querySelector(".tr-link");
        if (link)
            link.remove();
    }
    function removeParentLink(item) {
        var link = item.querySelector(".parent-link");
        if (link)
            link.remove();
    }

    var savedScrollY = 0;
    function setupHeader(div) {
        var header = document.createElement("div");
        header.innerHTML = popupHeaderText;
        div.appendChild(header);
        header.querySelector("button").onclick = function() {
            div.remove();
            document.body.style.overflow = "scroll";
            window.scrollTo(window.scrollX, savedScrollY);
        };
    }

    var div = document.querySelector(".popup");
    if (div) {
        div.remove();
    }
    div = document.createElement("div");

    setupHeader(div);

    div.classList.add("popup");
    var thread = getLineThread(item);
    thread.forEach(function(item) {
        var node = item.cloneNode(true);
        removeIndent(node);
        removeTrLink(node);
        removeParentLink(node);
        div.appendChild(node);
    });

    container.appendChild(div);
    savedScrollY = window.scrollY;
    document.body.style.overflow = "hidden";
}

var initialized = false;

function injectButtons() {
    var popup = null;

    function createTrLink(item) {
        var trLink = document.createElement("a");
        trLink.href = "#";
        trLink.classList.add("tr-link");
        trLink.textContent = "[view threadline]";
        trLink.onclick = function() {
            showLineThread(item);
        }
        return trLink;
    }

    function popupAbove(item) {
        //var h = window.innerHeight/2;
        var x = item.offsetTop - window.scrollY;
        return x > 0;
    }

    function computedHeight(node) {
        var h = getComputedStyle(node).height;
        return parseInt(h);
    }

    function createParentLink(item) {
        var parentLink = document.createElement("a");
        parentLink.classList.add("parent-link");
        parentLink.textContent = "[parent]";
        parentLink.onmouseover = function() {
            var parent = getParentItem(item);
            if (parent) {
                parentLink.href = "#"+parent.id;
                popup = parent.cloneNode(true);
                removeIndent(popup);

                if (popupAbove(item))
                    popup.style.top = 0;
                else
                    popup.style.bottom = 0;

                merge(popup.style, {
                    width: "80%",
                    border: "3px solid #900",
                    padding: "10px",
                    margin: "0 auto",
                    position: "fixed",
                    height: (window.innerHeight/2 * 0.8)+"px",
                    overflow: "hidden",
                    backgroundColor: "#f6f6ef",
                });
                container.appendChild(popup);
            }
        }
        parentLink.onmouseout = function() {
            if (popup) {
                popup.remove();
                popup = null;
            }
        }
        return parentLink;
    }

    var items = listAllItems();
    for (var i = 0; i < items.length; i++) {
        (function(item) {
            if (getLevel(item) == 0)
                return;

            var comhead = item.querySelector(".comhead");
            var trLink = createTrLink(item);
            var parentLink = createParentLink(item);

            comhead.appendChild(trLink);
            comhead.appendChild(parentLink);
        })(items[i]);
    }
}

function webextUltraOmegaExcessivePageInitializationProtectionScheme() {
    var div = document.createElement("div");
    div.id = "wah";
    document.body.appendChild(div);
}

function isInitialized() {
    return !!document.querySelector("#wah");
}

function init() {
    if (isInitialized())
        return;

    injectButtons();
    insertCss();

    webextUltraOmegaExcessivePageInitializationProtectionScheme();
}


init();


// TODO: make styling less crappy
// TODO: add item shuffling

