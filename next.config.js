/** @type {import('next').NextConfig} */
const nextConfig = {
    speechKey: process.env.SPEECH_KEY,
    speechRegion: process.env.SPEECH_REGION
}

module.exports = nextConfig
