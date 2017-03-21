# Deferred Shader

Demo: <a href="https://anzuhakone.com/projects/graphics/index.html">Link</a>

Collaborators: Megan Van Welie

## Description
Final project of COMP 175 Graphics class. We implemented a deferred shader using GLSL. 
Deferred shading is a form of scene rendering: all of the components that contribute to shading (e.g., normals, position, color, depth) is rendered onto a texture first (G-buffer) and then the shading is calculated per pixel using the G-buffer textures. Unlike ray casting, which could have long rendering times, deferred shading allows for not just rendering of many lighting but also rendering of moving lights at a faster speed.