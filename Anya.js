// ==UserScript==
// @name         Draggable JS Executor (Full Drag, True Black, No Divider)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Floating draggable black box with purple border, line numbers; drag whole container, unified black header, refined look
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const box = document.createElement("div");
    box.id = "jsExecutorBox";
    box.innerHTML = `
      <div id="jsExecHeader"><span>JS Runner</span></div>
      <div id="jsExecContent">
        <div id="lineNumbers"></div>
        <textarea id="jsExecInput" placeholder="Paste JS code or GitHub/raw link..."></textarea>
      </div>
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
        width: 320px;
        height: 250px;
        background: #000;
        border: 2px solid purple;
        border-radius: 6px;
        box-shadow:
          0 0 12px 2px purple,
          0 0 20px 6px black;
        font-family: Arial, sans-serif;
        font-size: 13px;
        z-index: 999999;
        user-select: none;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      #jsExecHeader {
        padding: 12px 0 12px 0;
        background: #000;
        color: white;
        cursor: grab;
        font-size: 16px;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        display: flex;
        border-bottom: 1px solid #222;
        font-weight: bold;
        letter-spacing: 0.5px;
        width: 100%;
      }
      #jsExecHeader span {
        width: 100%;
        text-align: center;
      }
      #jsExecContent {
        display: flex;
        flex-grow: 1;
        background: #000;
        overflow: hidden;
        height: 100px;
      }
      #lineNumbers {
        padding: 6px 4px 6px 8px;
        background: #111;
        color: #888;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.3em;
        user-select: none;
        text-align: right;
        width: 30px;
        overflow-y: auto;
        white-space: nowrap;
        border-right: none;
      }
      #lineNumbers div {
        height: 1.3em;
        line-height: 1.3em;
      }
      #jsExecInput {
        flex: 1;
        margin: 6px 6px 6px 0;
        background: #111;
        color: #0f0;
        border: none;
        outline: none;
        font-family: monospace;
        font-size: 13px;
        border-radius: 4px;
        padding: 4px 6px;
        line-height: 1.3em;
        resize: none;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      #jsExecBtnBox {
        text-align: center;
        margin: 6px;
        flex-shrink: 0;
      }
      #jsExecBtnBox button {
        padding: 5px 10px;
        margin: 2px;
        border: 1px solid purple;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        background: #222;
        color: white;
        transition: background 0.2s;
        user-select: none;
      }
      #jsExecBtnBox button:hover {
        background: #333;
      }
      #jsExecInput::-webkit-scrollbar, #lineNumbers::-webkit-scrollbar {
        width: 8px;
      }
      #jsExecInput::-webkit-scrollbar-thumb, #lineNumbers::-webkit-scrollbar-thumb {
        background: purple;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    let dragging = false, offsetX=0, offsetY=0;
    function getXY(e) {
        return e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
    }
    function startDrag(e) {
        dragging = true;
        const [clientX, clientY] = getXY(e);
        offsetX = clientX - box.offsetLeft;
        offsetY = clientY - box.offsetTop;
        box.style.cursor = "grabbing";
        e.preventDefault();
    }
    function duringDrag(e) {
        if(!dragging) return;
        const [clientX, clientY] = getXY(e);
        box.style.left = (clientX - offsetX) + "px";
        box.style.top = (clientY - offsetY) + "px";
    }
    function stopDrag() {
        dragging = false;
        box.style.cursor = "";
    }
    box.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", duringDrag);
    document.addEventListener("mouseup", stopDrag);
    box.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", duringDrag, { passive: false });
    document.addEventListener("touchend", stopDrag);

    const textarea = box.querySelector("#jsExecInput");
    const lineNumbers = box.querySelector("#lineNumbers");
    function updateLineNumbers() {
        const lines = textarea.value.split('\n').length || 1;
        lineNumbers.innerHTML = '';
        for(let i=1; i<=lines; i++) {
            const div = document.createElement('div');
            div.textContent = i;
            lineNumbers.appendChild(div);
        }
    }
    textarea.addEventListener('input', () => {
        updateLineNumbers();
        syncScroll();
    });
    textarea.addEventListener('scroll', syncScroll);
    function syncScroll() {
        lineNumbers.scrollTop = textarea.scrollTop;
    }
    updateLineNumbers();

    function toRawGithubLink(url){
        try {
            if(url.includes("github.com") && !url.includes("raw.githubusercontent.com")){
                return url
                    .replace("github.com", "raw.githubusercontent.com")
                    .replace("/blob/", "/");
            }
        } catch(e){}
        return url;
    }
    const runBtn = box.querySelector("#jsExecRun");
    const clearBtn = box.querySelector("#jsExecClear");
    runBtn.addEventListener("click", async () => {
        let input = textarea.value.trim();
        if(!input) return;
        if(/^https?:\/\//i.test(input)){
            let link = toRawGithubLink(input);
            try {
                let res = await fetch(link);
                if(!res.ok) throw new Error("HTTP error " + res.status);
                let code = await res.text();
                eval(code);
            } catch(err){
                alert("Error fetching/executing: " + err);
            }
        } else {
            try {
                eval(input);
            } catch(err){
                alert("Execution error: " + err);
            }
        }
    });
    clearBtn.addEventListener("click", () => {
        textarea.value = "";
        updateLineNumbers();
    });
})();
