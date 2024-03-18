module.exports = {
	apps: [
		{
			name: "blackTea",
			script: "./src/loaders/server.js",
			env_production: {
				NODE_ENV: "production"
			},
			env_development: {
				NODE_ENV: "development"
			},
			watch: true,
			watch_delay: 1000,
			ignore_watch: ["node_modules"],
			max_memory_restart: "1G",
			out_file: "./logfile",
			error_file: "./errorfile"
		}
	]
}