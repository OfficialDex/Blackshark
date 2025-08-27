// ==UserScript==
// @name         Draggable JS Executor (Dark + Mobile + Line Numbers)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Floating draggable black box with purple border, line numbers, and black-purple shadow (works on PC & mobile)
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- Create container elements ---
    const box = document.createElement("div");
    box.id = "jsExecutorBox";
    box.innerHTML = `
      <div id="jsExecHeader">JS Runner</div>
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

    // --- Styles (Dark Mode + Black to Purple Shadow + Line Numbers) ---
    const style = document.createElement("style");
    style.textContent = `
      #jsExecutorBox {
        position: fixed;
        top: 50px;
        left: 50px;
        width: 300px;
        background: #000;
        border: 2px solid purple;
        border-radius: 6px;
        box-shadow:
          0 0 12px 2px purple,
          0 0 20px 6px black;
        font-family: Arial, sans-serif;
        font-size: 13px;
        z-index: 999999;
        resize: both;
        overflow: hidden;
        color: white;
        user-select: none;
      }
      #jsExecHeader {
        padding: 6px;
        background: purple;
        color: white;
        cursor: move;
        font-size: 14px;
      }
      #jsExecContent {
        display: flex;
        background: #000;
      }
      #lineNumbers {
        padding: 6px 4px 6px 8px;
        background: #111;
        border-right: 2px solid purple;
        color: #888;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.3em;
        user-select: none;
        text-align: right;
        width: 30px;
        overflow: hidden;
      }
      #jsExecInput {
        flex: 1;
        height: 90px;
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
        overflow-y: scroll;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      #jsExecBtnBox {
        text-align: center;
        margin: 6px;
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
      /* Scrollbar styling for textarea */
      #jsExecInput::-webkit-scrollbar {
        width: 8px;
      }
      #jsExecInput::-webkit-scrollbar-thumb {
        background: purple;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    // --- Dragging logic (PC + Mobile) ---
    const header = box.querySelector("#jsExecHeader");
    let dragging = false, offsetX=0, offsetY=0;

    function startDrag(e){
        dragging = true;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - box.offsetLeft;
        offsetY = clientY - box.offsetTop;
        e.preventDefault();
    }
    function duringDrag(e){
        if(dragging){
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            box.style.left = (clientX - offsetX) + "px";
            box.style.top = (clientY - offsetY) + "px";
        }
    }
    function stopDrag(){
        dragging = false;
    }

    header.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", duringDrag);
    document.addEventListener("mouseup", stopDrag);

    header.addEventListener("touchstart", startDrag, {passive:false});
    document.addEventListener("touchmove", duringDrag, {passive:false});
    document.addEventListener("touchend", stopDrag);

    // --- Line numbers logic ---
    const textarea = box.querySelector("#jsExecInput");
    const lineNumbers = box.querySelector("#lineNumbers");

    function updateLineNumbers() {
        const linesCount = textarea.value.split('\n').length;
        let numbers = '';
        for(let i=1; i <= linesCount; i++) {
            numbers += i + '\n';
        }
        lineNumbers.textContent = numbers;
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

    // --- Helper: turn GitHub link -> raw ---
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

    // --- Execution Buttons ---
    const runBtn = box.querySelector("#jsExecRun");
    const clearBtn = box.querySelector("#jsExecClear");

    runBtn.addEventListener("click", async ()=>{
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

    clearBtn.addEventListener("click", ()=> {
        textarea.value = "";
        updateLineNumbers();
    });
})();
