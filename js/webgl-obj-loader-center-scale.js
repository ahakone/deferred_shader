(function (scope, undefined) {
  'use strict';

  var OBJ = {};

  if (typeof module !== 'undefined') {
    module.exports = OBJ;
  } else {
    scope.OBJ = OBJ;
  }

  OBJ.Mesh = function (objectData) {
    var verts = [], vertNormals = [], textures = [], unpacked = {};

    // unpacking stuff
    unpacked.verts = [];
    unpacked.norms = [];
    unpacked.textures = [];
    unpacked.hashindices = {};
    unpacked.indices = [];
    unpacked.index = 0;
    // array of lines separated by the newline
    var lines = objectData.split('\n');

    var VERTEX_RE = /^v\s/;
    var NORMAL_RE = /^vn\s/;
    var TEXTURE_RE = /^vt\s/;
    var FACE_RE = /^f\s/;
    var WHITESPACE_RE = /\s+/;

    var xmin = 100000;
    var xmax = -100000;
    var ymin = 100000;
    var ymax = -100000;
    var zmin = 100000;
    var zmax = -100000;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var elements = line.split(WHITESPACE_RE);
      elements.shift();

      if (VERTEX_RE.test(line)) {
        // if this is a vertex
        verts.push.apply(verts, elements);
        if (elements[0] < xmin) {
            xmin = elements[0];
        }
        if (elements[0] > xmax) {
            xmax = elements[0];
        }
        if (elements[1] < ymin) {
            ymin = elements[1];
        }
        if (elements[1] > ymax) {
            ymax = elements[1];
        }
        if (elements[2] < zmin) {
            zmin = elements[2];
        }
        if (elements[2] > zmax) {
            zmax = elements[2];
        }
      } else if (NORMAL_RE.test(line)) {
        // if this is a vertex normal
        vertNormals.push.apply(vertNormals, elements);
      } else if (TEXTURE_RE.test(line)) {
        // if this is a texture
        textures.push.apply(textures, elements);
      } else if (FACE_RE.test(line)) {
        // if this is a face
        /*
        split this face into an array of vertex groups
        for example:
           f 16/92/11 14/101/22 1/69/1
        becomes:
          ['16/92/11', '14/101/22', '1/69/1'];
        */
        var quad = false;
        for (var j = 0, eleLen = elements.length; j < eleLen; j++){
            // Triangulating quads
            // quad: 'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2 v3/t3/vn3/'
            // corresponding triangles:
            //      'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2'
            //      'f v2/t2/vn2 v3/t3/vn3 v0/t0/vn0'
            if(j === 3 && !quad) {
                // add v2/t2/vn2 in again before continuing to 3
                j = 2;
                quad = true;
            }
     //       console.log(elements[j]);
     //       if(elements[j] in unpacked.hashindices){
     //           unpacked.indices.push(unpacked.hashindices[elements[j]]);
     //       }
     //       else{
                /*
                Each element of the face line array is a vertex which has its
                attributes delimited by a forward slash. This will separate
                each attribute into another array:
                    '19/92/11'
                becomes:
                    vertex = ['19', '92', '11'];
                where
                    vertex[0] is the vertex index
                    vertex[1] is the texture index
                    vertex[2] is the normal index
                 Think of faces having Vertices which are comprised of the
                 attributes location (v), texture (vt), and normal (vn).
                 */
                var vertex = elements[ j ].split( '/' );
                unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 0]);
                unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 1]);
                unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 2]);
                // vertex textures
                if (textures.length) {
                  unpacked.textures.push(+textures[(vertex[1] - 1) * 2 + 0]);
                  unpacked.textures.push(+textures[(vertex[1] - 1) * 2 + 1]);
                }
                // vertex normals
                unpacked.norms.push(+vertNormals[(vertex[2] - 1) * 3 + 0]);
                unpacked.norms.push(+vertNormals[(vertex[2] - 1) * 3 + 1]);
                unpacked.norms.push(+vertNormals[(vertex[2] - 1) * 3 + 2]);
                // add the newly created vertex to the list of indices
                unpacked.hashindices[elements[j]] = unpacked.index;
                unpacked.indices.push(unpacked.index);
                // increment the counter
                unpacked.index += 1;
     //      }
            if(j === 3 && quad) {
                // add v0/t0/vn0 onto the second triangle
                unpacked.indices.push( unpacked.hashindices[elements[0]]);
            }
        }
      } // end of RE if statment
    } // end of lines loop

    this.xmin = parseFloat(xmin);
    this.xmax = parseFloat(xmax);
    this.ymin = parseFloat(ymin);
    this.ymax = parseFloat(ymax);
    this.zmin = parseFloat(zmin);
    this.zmax = parseFloat(zmax);

    this.vertices = unpacked.verts;
    this.vertexNormals = unpacked.norms;
    this.textures = unpacked.textures;
    this.indices = unpacked.indices;
  }

  OBJ.move = function(mesh, xadj, yadj, zadj){
    for (var i = 0; i < mesh.vertices.length / 3; i++) {
        mesh.vertices[i * 3 + 0] = mesh.vertices[i * 3 + 0] + xadj;
        mesh.vertices[i * 3 + 1] = mesh.vertices[i * 3 + 1] + yadj;
        mesh.vertices[i * 3 + 2] = mesh.vertices[i * 3 + 2] + zadj;
    }
  }

  OBJ.center = function(mesh){
    var xavg = (mesh.xmax + mesh.xmin) / 2.0;
    var yavg = (mesh.ymax + mesh.ymin) / 2.0;
    var zavg = (mesh.zmax + mesh.zmin) / 2.0;
    for (var i = 0; i < mesh.vertices.length / 3; i++) {
        mesh.vertices[i * 3 + 0] = mesh.vertices[i * 3 + 0] - xavg;
        mesh.vertices[i * 3 + 1] = mesh.vertices[i * 3 + 1] - yavg;
        mesh.vertices[i * 3 + 2] = mesh.vertices[i * 3 + 2] - zavg;
    }
  }

  OBJ.scale = function(mesh){
    var max = 0;
    for (var i = 0; i < mesh.vertices.length; i++) {
        if ( max < Math.abs(mesh.vertices[i])) {
            max = Math.abs(mesh.vertices[i]);
        }
    }
    for (var i = 0; i < mesh.vertices.length / 3; i++) {
        mesh.vertices[i * 3 + 0] = (mesh.vertices[i * 3 + 0] * 1.5 / max);
        mesh.vertices[i * 3 + 1] = (mesh.vertices[i * 3 + 1] * 1.5 / max);
        mesh.vertices[i * 3 + 2] = (mesh.vertices[i * 3 + 2] * 1.5 / max);
     }
  }

  var _buildBuffer = function( gl, type, data, itemSize ){
    var buffer = gl.createBuffer();
    var arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    return buffer;
  }

  OBJ.initMeshBuffers = function( gl, mesh ){
    mesh.normalBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertexNormals, 3);
    mesh.textureBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.textures, 2);
    mesh.vertexBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertices, 3);
    mesh.indexBuffer = _buildBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, mesh.indices, 1);
  }

  OBJ.deleteMeshBuffers = function( gl, mesh ){
    gl.deleteBuffer(mesh.normalBuffer);
    gl.deleteBuffer(mesh.textureBuffer);
    gl.deleteBuffer(mesh.vertexBuffer);
    gl.deleteBuffer(mesh.indexBuffer);
  }
})(this);

