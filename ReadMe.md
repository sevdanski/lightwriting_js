# LightWriting JS

A small demo showing how my light writing effect could possibly be achieved in JavaScript.

This effect was originally created in Flash / ActionScript and the original project can be found in me [LightWritingAS3 repo](https://www.github.com/sevdanski/LightWritingAS3).

The final result of this is not as smooth as the AS3 version - I believe that this is mostly because the Canvas object does not have the same amount of support for filters that AS3 Bitmaps have.

Still, it looks pretty close to the original and should work in most modern browsers.

## Project Rundown
This project contains a number of pieces that should be fairly straight forward.

The index.html file is a basic html template with the links to the required js and css files. It contains a single line call to create the LightWriterDemo class which then injects the required html into the target DIV.

The lightwriter.js file contains all of the classes used to run the demo.

Theh LightWriterCanvas class does most of the heavy lifting in regards to drawing the canvas.

The LightWriterDemo class does the work of setting the canvases up and making them interact with the mouse.

There are a couple of css files as well that are just to make sure that the UI elements are rendered at a suitable size.
