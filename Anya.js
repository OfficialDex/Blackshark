// ==UserScript==
// @name         Draggable JS Executor (Pill Shadow Horizontal Scroll)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Draggable black JS executor with pill header, wide purple shadow, no scrollbars, full textarea focus and usability
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const box = document.createElement("div");
    box.id = "jsExecutorBox";
    box.innerHTML = `
      <div id="jsPillHeaderBox">
        <div id="jsPillHeader" tabindex="0">
          <span contenteditable="true" spellcheck="false" style="outline:none;white-space:nowrap;">JS EXECUTOR PILLED HEADER - DRAG ANYWHERE</span>
        </div>
      </div>
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
        width: 340px;
        height: 255px;
        background: #000;
        border: 2px solid purple;
        border-radius: 11px;
        box-shadow:
          0 0 10px 3px purple,
          0 0 20px 10px black;
        font-family: Arial, sans-serif;
        font-size: 13px;
        z-index: 999999;
        user-select: none;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      #jsPillHeaderBox {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding-top: 8px;
        padding-bottom: 12px;
        background: transparent;
        flex-shrink: 0;
        border-radius: 0;
      }
      #jsPillHeader {
        min-width: 150px;
        max-width: 80vw;
        width: 92%;
        padding: 13px 40px 13px 30px;
        margin: 0 auto;
        background: #111;
        color: #a68cff;
        border-radius: 40px / 30px;
        font-size: 16px;
        font-weight: bold;
        letter-spacing: .8px;
        border: none;
        box-shadow: 0 0 24px 7px purple;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        outline: none;
        cursor: grab;
        transition: box-shadow .2s;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #jsPillHeader::-webkit-scrollbar {
        display: none !important;
        height: 0 !important;
      }
      #jsPillHeader:active {
        cursor: grabbing;
        box-shadow: 0 0 36px 12px #8000ff;
      }
      #jsExecContent {
        display: flex;
        flex-grow: 1;
        background: #000;
        overflow: hidden;
        height: 100px;
      }
      #lineNumbers {
        padding: 6px 4px 6px 10px;
        background: #111;
        color: #888;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.3em;
        user-select: none;
        text-align: right;
        width: 30px;
        overflow-y: auto;
        overflow-x: hidden;
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
        overflow-x: auto;
        white-space: pre;
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

    let dragging = false, offsetX=0, offsetY=0, dragStartTarget=null;
    function getXY(e) {
        return e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
    }
    function isInteractive(el) {
        // Block dragging if the element is the textarea or its children or is being edited
        return el.closest("#jsExecInput") || el.closest("#jsExecBtnBox");
    }
    function startDrag(e) {
        dragStartTarget = e.target;
        if (isInteractive(dragStartTarget)) return;
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

    // Make pill header scrollable (with mousewheel for overflow)
    const pillHeader = document.getElementById("jsPillHeader");
    pillHeader.addEventListener('wheel', e => {
        if (e.deltaX !== 0) return;
        pillHeader.scrollLeft += e.deltaY;
        e.preventDefault();
    }, { passive: false });

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
