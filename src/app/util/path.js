import path from 'path';

const resolve = path.resolve || ((...paths) => {
    const items = [];
    for (const item of paths) {
        if (!item || item === "..") continue;
        items.push(item);
    }
    return items.join("/");
});

const basename = path.basename || ((path, suffix) => {
    const index1 = path.lastIndexOf("/");
    const index2 = path.lastIndexOf("\\");
    const index = Math.max(index1, index2);
    return path.substring(0, index);
});

export default {
    resolve,
    basename,
}

export {
    resolve,
    basename,
}