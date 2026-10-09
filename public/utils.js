function resourcePath(relativePath) {
    // In a web environment, we don't need to handle different base paths
    // as we did in Python. We can simply return the relative path.
    return relativePath;
}
