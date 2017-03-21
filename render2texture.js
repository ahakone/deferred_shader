// var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
// var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
// var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
// var flipYLocation = gl.getUniformLocation(program, "u_flipY");


var filters = {
    normal: [
        0, 0, 0,
        0, 1, 0, 
        0, 0, 0
    ],
    edgeDetection: [
        0, 1, 0,
        1, -4, 1, 
        0, 1, 0
    ], 
    edgeEnhance: [
        0, 0, 0,
            -1, 1, 0,
        0, 0, 0
    ],
    emboss: [
            -2, -1, 0,
            -1, 1, 1, 
        0, 1, 2
    ] 
}

// do something like
// var image = new Image();
// image.src = "oldhousetexture.jpg";
// image.onload = initFramebuffer(image);


function setFramebuffer(buffer, width, height) {
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);

    // Tell the shader the resolution of the framebuffer.
    //    gl.uniform2f(resolutionLocation, width, height);

    // Tell webgl the viewport setting needed for framebuffer.
    gl.viewport(0, 0, width, height);
}

function drawFilter() {
    // set the kernel
    //    gl.uniform1fv(kernelLocation, kernels[name]);
    
    // Draw the rectangle.
    //    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
//finall draw to canvas
//setFramebuffer(null, canvas.width, canvas.height);
//drawWithKernel("normal");

var rttFramebuffer;
var rttTexture;

// render to a Framebuffer
// It’s a container for textures and an optional depth buffer
function initTextureFramebuffer() {
    // Create framebuffer
    rttFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    rttFramebuffer.width = 512; // needs to be powers of 2
    rttFramebuffer.height = 512; // needs to be powers of 2

    // Create texture
    rttTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rttTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    // tells OpenGL that we don’t have any image data, but we’d just like it 
    // to allocate empty space on the graphics card for our texture (hence "null")
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, 
                  rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Create depth buffer
    // Render buffer = generic kind of object that stores some lump of memory 
    // that we’re intending to associate with a framebuffer
    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
                           rttFramebuffer.width, rttFramebuffer.height);

    // attach everything to the current framebuffer
    // rendering colours to gl.COLOR_ATTACHMENT0, ie current texture
    // depth information in gl.DEPTH_ATTACHMENT, ie current depth buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                            gl.TEXTURE_2D, rttTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                               gl.RENDERBUFFER, renderbuffer);

}
/* Should go in drawscene
   gl.bindTexture(gl.TEXTURE_2D, null);
   gl.bindRenderbuffer(gl.RENDERBUFFER, null);
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
*/
