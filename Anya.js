// ==UserScript==
// @name         Draggable JS Executor (Dark + Mobile)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Floating draggable black box with purple border for JS execution (works on PC & mobile)
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
      <textarea id="jsExecInput" placeholder="Paste JS code or GitHub/raw link..."></textarea>
      <div id="jsExecBtnBox">
        <button id="jsExecRun">Execute</button>
        <button id="jsExecClear">Clear</button>
      </div>
    `;
    document.body.appendChild(box);

    // --- Styles (Dark Mode) ---
    const style = document.createElement("style");
    style.textContent = `
      #jsExecutorBox {
        position: fixed;
        top: 50px;
        left: 50px;
        width: 260px;
        background: #000; /* Dark black background */
        border: 2px solid purple; /* Purple stroke */
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        font-family: Arial, sans-serif;
        font-size: 13px;
        z-index: 999999;
        resize: both;
        overflow: hidden;
        color: white;
      }
      #jsExecHeader {
        padding: 6px;
        background: purple; /* Purple header */
        color: white;
        cursor: move;
        font-size: 14px;
        user-select: none;
      }
      #jsExecInput {
        width: 94%;
        height: 90px;
        margin: 6px;
        background: #111; /* Slightly lighter black textarea */
        color: #0f0; /* Green terminal-like text */
        border: 1px solid purple;
        font-family: monospace;
        font-size: 13px;
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
        background: #222; /* Light black contrast */
        color: white;
        transition: background 0.2s;
      }
      #jsExecBtnBox button:hover {
        background: #333; /* Slightly lighter on hover */
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

    // Mouse events
    header.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", duringDrag);
    document.addEventListener("mouseup", stopDrag);

    // Touch events (mobile)
    header.addEventListener("touchstart", startDrag, {passive:false});
    document.addEventListener("touchmove", duringDrag, {passive:false});
    document.addEventListener("touchend", stopDrag);

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

    // --- Execution ---
    const textarea = box.querySelector("#jsExecInput");
    const runBtn = box.querySelector("#jsExecRun");
    const clearBtn = box.querySelector("#jsExecClear");

    runBtn.addEventListener("click", async ()=>{
        let input = textarea.value.trim();
        if(!input) return;

        // If link -> fetch & execute
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
                eval(input); // Direct code
            } catch(err){
                alert("Execution error: " + err);
            }
        }
    });

    clearBtn.addEventListener("click", ()=> textarea.value = "");
})();
