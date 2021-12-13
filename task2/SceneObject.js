//core

R2D.SceneObject = function(data) {
    EventDispatcher.call(this);

    R2D.SceneObject.__counter += 1;

    var scope = this;
    var _objectId = R2D.SceneObject.__counter;
    var _type = data.type;
    var _target = data.target;
    var _objectData = data;
    var _defaultWidth = data.property.sizes.width;
    var _defaultHeight = data.property.sizes.height;
    var _defaultDepth = data.property.sizes.depth;
    
    
    
    scope.x = data.property.position.x||0;                  /////////////////////////////////////////////////////////////////                                   
    scope.y = data.property.position.y||50;                 /////////////////////////////////////////////////////////////////
    scope.z = data.property.position.z||0;                  /////////////////////////////////////////////////////////////////
    scope.rotationX = 0;
    scope.rotationY = 0;
    scope.rotationZ = 0;
    scope.scaleX = 1;
    scope.scaleY = 1;
    scope.scaleZ = 1;
    scope.flipX = false;
    scope.flipY = false;
    scope.flipZ = false;

    scope.configurationAppId = data.configurationAppId;
    scope.configAppFile = R2D.makeURL(R2D.URL.DOMAIN, data.configAppFile);
    scope.originalEntityId = data.originalEntityId;
    scope.isOriginalModel = data.isOriginalModel;

    function checkValues() {
        if ( scope.x < R2D.SceneObject.OBJECT_X_MIN ) {
            scope.x = R2D.SceneObject.OBJECT_X_MIN;
        } else if ( scope.x > R2D.SceneObject.OBJECT_X_MAX ) {
            scope.x = R2D.SceneObject.OBJECT_X_MAX;
        }
        if ( scope.y < R2D.SceneObject.OBJECT_Y_MIN ) {
            scope.y = R2D.SceneObject.OBJECT_Y_MIN;
        } else if ( scope.y > R2D.SceneObject.OBJECT_Y_MAX ) {
            scope.y = R2D.SceneObject.OBJECT_Y_MAX;
        }
        if ( scope.z < R2D.SceneObject.OBJECT_Z_MIN ) {
            scope.z = R2D.SceneObject.OBJECT_Z_MIN;
        } else if ( scope.z > R2D.SceneObject.OBJECT_Z_MAX ) {
            scope.z = R2D.SceneObject.OBJECT_Z_MAX;
        }

        scope.scaleX = R2D.SceneObject.__getCorrectScale(scope.scaleX, _defaultWidth);
        scope.scaleY = R2D.SceneObject.__getCorrectScale(scope.scaleY, _defaultHeight);
        scope.scaleZ = R2D.SceneObject.__getCorrectScale(scope.scaleZ, _defaultDepth);
    }

    Object.defineProperties(scope, {
        "objectId":{
            get() { return _objectId }
        },
        "productId":{
            get() { return _objectData.productId; }
        },
        "objectData":{
            get() { return _objectData }
        },
        "type":{
            get() { return _type }
        },
        "userKey":{
            get() { return _objectData.user_key }
        },
        "target":{
            get() { return _target }
        },
        "defaultWidth":{
            get() { return _defaultWidth; }
        },
        "defaultHeight":{
            get() { return _defaultHeight; }
        },
        "defaultDepth":{
            get() { return _defaultDepth; }
        },
        "width":{
            get() { return _defaultWidth * scope.scaleX; },
            set(value) { scope.scaleX = value / _defaultWidth; }
        },
        "height":{
            get() { return _defaultHeight * scope.scaleY; },
            set(value) { scope.scaleY = value / _defaultHeight; }
        },
        "depth":{
            get() { return _defaultDepth * scope.scaleZ },
            set(value) { scope.scaleZ = value / _defaultDepth; }
        },
        "volume":{
            get() { return scope.width * scope.height * scope.depth; },
            set(value) {
                console.warn("SceneObject.volume.set(): TODO");
            }
        }
    });

    scope.getObjectId = function() { return scope.objectId; };
    scope.getProductId = function() { return _objectData.productId };
    scope.getType = function() { return scope.type };
    scope.getObjectData = function() { return _objectData };
    scope.getName = function() { return _objectData['name'] };
    scope.getDefaultWidth = function() { return _defaultWidth };
    scope.getDefaultHeight = function() { return _defaultHeight };
    scope.getDefaultDepth = function() { return _defaultDepth };
    scope.getWidth = function() { return scope.width };
    scope.getHeight = function() { return scope.height };
    scope.getDepth = function() {
        return scope.depth
    };

    scope.historyUpdate = function() {
        scope.dispatchEvent(new Event(R2D.SceneObject.HISTORY_UPDATE, scope));
    };
    scope.setWidth = function(value) {
        scope.scaleX = value / _defaultWidth;
    };
    scope.setHeight = function(value) {
        scope.scaleY = value / _defaultHeight;
    };
    scope.setDepth = function(value) {
        scope.scaleZ = value / _defaultDepth;
    };

    scope.setSize = function(width, height, depth) {
        scope.scaleX = width / _defaultWidth;
        scope.scaleY = height / _defaultHeight;
        scope.scaleZ = depth / _defaultDepth;
    };
    scope.update = function() {
        checkValues();
        scope.dispatchEvent(new Event(Event.UPDATE, scope));
    };
    scope.clone = function() {
        throw "TODO";
    }
};

R2D.extend(R2D.SceneObject, EventDispatcher);

R2D.SceneObject.HISTORY_UPDATE = 'historyUpdate';
R2D.SceneObject.OBJECT_SIZE_MIN = 2;
R2D.SceneObject.OBJECT_SIZE_MAX = 600;
R2D.SceneObject.OBJECT_X_MIN = -Infinity;
R2D.SceneObject.OBJECT_X_MAX = Infinity;
R2D.SceneObject.OBJECT_Y_MIN = 0;
R2D.SceneObject.OBJECT_Y_MAX = 400;
R2D.SceneObject.OBJECT_Z_MIN = -Infinity;
R2D.SceneObject.OBJECT_Z_MAX = Infinity;

R2D.SceneObject.APPOINTMENT_SCENE = "scene";
R2D.SceneObject.APPOINTMENT_WALL = "wall";

R2D.SceneObject.__counter = 0;

R2D.SceneObject.__getCorrectScale = function(scale, size) {
    if ( scale * size < R2D.SceneObject.OBJECT_SIZE_MIN ) {
        return R2D.SceneObject.OBJECT_SIZE_MIN / size;
    }
    if ( scale * size > R2D.SceneObject.OBJECT_SIZE_MAX ) {
        return R2D.SceneObject.OBJECT_SIZE_MAX / size;
    }

    return scale;
};

R2D.SceneObject.prototype.get2DRectPoints = function() {
    var w2 = this.getWidth() / 2;
    var d2 = this.getDepth() / 2;

    return [
        new GEOM.Point(-w2, -d2),
        new GEOM.Point( w2, -d2),
        new GEOM.Point( w2,  d2),
        new GEOM.Point(-w2,  d2)
    ];
};

R2D.SceneObject.get2DBounds = function(sceneObject) {
    var rectPoints = sceneObject.get2DRectPoints();
    var rotation = -GEOM.toRad(sceneObject.rotationY);
    var minX =  Infinity;
    var maxX = -Infinity;
    var minY =  Infinity;
    var maxY = -Infinity;
    
    for ( var i = 0, l = rectPoints.length; i < l; i++ ) {
        var p = rectPoints[i];

        p = GEOM.rotatePosition(p.x, p.y, rotation);

        p.x += sceneObject.x;
        p.y += sceneObject.z;

        if ( p.x > maxX ) maxX = p.x;
        else if ( p.x < minX ) minX = p.x;

        if ( p.y > maxY ) maxY = p.y;
        else if ( p.y < minY ) minY = p.y;
    }
    
    return new GEOM.Bounds(minX, minY, maxX, maxY);
};