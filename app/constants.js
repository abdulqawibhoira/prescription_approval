function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

//Database Collection Names 
define("COLLECTION_USERS", "users");
