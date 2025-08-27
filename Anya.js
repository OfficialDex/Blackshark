here// ==UserScript==
// @name         Draggable JS Executor (Mobile Friendly)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Floating draggable box to paste/execute JS or GitHub/raw links, full mobile/desktop draggable, black+purple UI
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    const box = document.createElement("div");
    box.id = "jsExecutorBox";
    box.innerHTML = `
      <div id="jsExecHeader">JS Runner</div>
      <textarea id="jsExecInput" placeholder="Paste JS code or GitHub/raw link..."></textarea>
      <div id="jsExecBtnBox">
        <button id="jsExecRun">Execute</button>
        <button id="jsExecClear">Clear</button>
      </div>
    `;
    document.body.appendChild(box);
    const style = document.createElement("style");
    style.textContent = `
      #jsExecutorBox {
        position: fixed;
        top: 50px;
        left: 50px;
        width: 260px;
        background: #000;
        border: 1px solid purple;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(128,0,128,0.7);
        font-family: Arial,sans-serif;
        font-size: 13px;
        z-index: 999999;
        resize: both;
        overflow: hidden;
        color: #e0e0e0;
      }
      #jsExecHeader {
        padding: 6px;
        background: #4b0082;
        color: white;
        cursor: grab;
        font-size: 14px;
        font-weight: bold;
        user-select: none;
        border-bottom: 1px solid purple;
      }
      #jsExecInput {
        width: 94%;
        height: 90px;
        margin: 6px;
        font-family: monospace;
        font-size: 13px;
        background: #111;
        color: #e0e0e0;
        border: 1px solid purple;
        border-radius: 4px;
        padding: 4px;
      }
      #jsExecBtnBox {
        text-align: center;
        margin-bottom: 6px;
      }
      #jsExecBtnBox button {
        padding: 5px 10px;
        margin: 2px;
        border: 1px solid purple;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        background: #1a1a1a;
        color: #e0e0e0;
        transition: background 0.2s,color 0.2s;
      }
      #jsExecBtnBox button:hover {
        background: #2c2c2c;
        color: #fff;
      }
      #jsExecRun { border-color: #6a0dad; }
      #jsExecClear { border-color: #9400d3; }
    `;
    document.head.appendChild(style);
    const header = box.querySelector("#jsExecHeader");
    let dragging = false, offsetX = 0, offsetY = 0;
    header.addEventListener('mousedown', function(e) {
        dragging = true;
        offsetX = e.clientX - box.offsetLeft;
        offsetY = e.clientY - box.offsetTop;
        document.body.style.userSelect = "none";
    });
    document.addEventListener('mousemove', function(e) {
        if (dragging) {
            box.style.left = (e.clientX - offsetX) + "px";
            box.style.top = (e.clientY - offsetY) + "px";
        }
    });
    document.addEventListener('mouseup', function() {
        dragging = false;
        document.body.style.userSelect = "";
    });
    header.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            dragging = true;
            offsetX = e.touches[0].clientX - box.offsetLeft;
            offsetY = e.touches[0].clientY - box.offsetTop;
            document.body.style.userSelect = "none";
        }
    }, {passive:false});
    document.addEventListener('touchmove', function(e) {
        if (dragging && e.touches.length === 1) {
            box.style.left = (e.touches[0].clientX - offsetX) + "px";
            box.style.top = (e.touches[0].clientY - offsetY) + "px";
            e.preventDefault();
        }
    }, {passive:false});
    document.addEventListener('touchend', function() {
        dragging = false;
        document.body.style.userSelect = "";
    });
    function toRawGithubLink(url) {
        try {
            if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
                return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
            }
        } catch(e){}
        return url;
    }
    const textarea = box.querySelector("#jsExecInput");
    const runBtn = box.querySelector("#jsExecRun");
    const clearBtn = box.querySelector("#jsExecClear");
    runBtn.addEventListener("click", async ()=>{
        let input = textarea.value.trim();
        if(!input) return;
        if(/^https?:\/\//i.test(input)){
            let link = toRawGithubLink(input);
            try {
                let res = await fetch(link);
                if(!res.ok) throw new Error("HTTP error "+res.status);
                let code = await res.text();
                eval(code);
            } catch(err){
                alert("Error fetching/executing: "+err);
            }
        } else {
            try {
                eval(input);
            } catch(err){
                alert("Execution error: "+err);
            }
        }
    });
    clearBtn.addEventListener("click", ()=> textarea.value = "");
})();
