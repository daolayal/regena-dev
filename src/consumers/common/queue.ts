export function decodeMessage<T>(message: string): Promise<T> {
    const bufferObj = Buffer.from(message, "base64");
    const decodedString = bufferObj.toString("utf8");
    return JSON.parse(decodedString);
}
