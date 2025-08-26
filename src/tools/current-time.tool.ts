export const getCurrentTime = (location: string): { location: string, current_time: string } => {
    return {location, current_time: new Date().toISOString()};
}
