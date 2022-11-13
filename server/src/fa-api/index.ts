export function faApiVersion() {
    return process.env.FA_API_VERSION || "v1.5";
}

export function faApiBaseUrl() {
    return [process.env.FA_API_PREFIX?.replace(/\/$/, ""), faApiVersion()].join("/");
}

export function faApiUrl(path: string) {
    return [faApiBaseUrl(), path.replace(/^\//, "")].join("/");
}

export function faApiAccessToken() {
    return process.env.FA_API_TOKEN;
}
