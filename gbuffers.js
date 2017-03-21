var gbuffers = [];

// gbuffer class
//var Gbuffer = function (obj_path, image_path) {
var Gbuffer = function () {
    
    var framebuffer;
    var normalTexture = gl.createTexture();
    var positionTexture = gl.createTexture();
    var colorTexture = gl.createTexture();
    var depthTexture = gl.createTexture();
    var depthRGBTexture = gl.createTexture();

    function initGbuffer() {
        //var mesh = initObjMesh(obj_path);
        //vertices = mesh.vertexBuffer; 
        //normals = mesh.normalBuffer;
        //imageCoordinates = mesh.textureBuffer;

        gl.getExtension("OES_texture_float");
        gl.getExtension("WEBGL_depth_texture");

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        // Geometry Frame Buffer (textures other than depth)
        gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height,
                      0, gl.RGBA, gl.FLOAT, null);

        gl.bindTexture(gl.TEXTURE_2D, this.positionTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height,
                      0, gl.RGBA, gl.FLOAT, null);
        

        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height,
                      0, gl.RGBA, gl.FLOAT, null);

        gl.bindTexture(gl.TEXTURE_2D, this.depthRGBTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height,
                      0, gl.RGBA, gl.FLOAT, null);

        // depth texture
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, canvas.width, canvas.height,
                      0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        // Create Frame Buffer
        var bufs = [];
        bufs[0] = ext.COLOR_ATTACHMENT0_WEBGL;
        bufs[1] = ext.COLOR_ATTACHMENT1_WEBGL;
        bufs[2] = ext.COLOR_ATTACHMENT2_WEBGL;
        bufs[3] = ext.COLOR_ATTACHMENT3_WEBGL;
        ext.drawBuffersWEBGL(bufs);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, bufs[0], gl.TEXTURE_2D, this.normalTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, bufs[1], gl.TEXTURE_2D, this.positionTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, bufs[2], gl.TEXTURE_2D, this.colorTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, bufs[3], gl.TEXTURE_2D, this.depthRGBTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

        var fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if ( fboStatus != gl.FRAMBUFFER_COMPLETE) {
            if (fboStatus == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
                console.log("incomplete attachment");
            } else if (fboStatus == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
                console.log("incomplete missing attachment");
            } else if (fboStatus == gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS) {
                console.log("incomplete dimensions");
            } else if (fboStatus == gl.FRAMEBUFFER_UNSUPPORTED) {
                console.log("unsupported");
            } else {
                console.log("????");
            }
            console.log("FRAMEBUFFER IS NOT COMPLETE!");
        }

        // Restore to default framebuffer and texture
        // gl.clear
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }



    return {
        initGbuffer: initGbuffer,
        initQuadBuffers: initQuadBuffers,
        normalTexture: normalTexture,
        positionTexture: positionTexture,
        colorTexture: colorTexture,
        depthRGBTexture: depthRGBTexture,
        depthTexture: depthTexture,
        framebuffer: framebuffer,
        vboVertexBuffer : vboVertexBuffer,
        vboTextureBuffer : vboTextureBuffer,
        vboIndexBuffer : vboIndexBuffer
    };
}
