// jest.config.js
export default {
	transform: {
		"^.+\\.js$": "babel-jest"
	},
	transformIgnorePatterns: [
		"node_modules/(?!(node-fetch|fetch-blob|formdata-polyfill|data-uri-to-buffer|web-streams-polyfill)/)"
	],
	testEnvironment: 'node'
}