//This is the configuration file for PM2
module.exports = {
	apps: [{
		name: 'Instore',           // Application name
		namespace: 'Instore',
		script: "./node_modules/next/dist/bin/next",            // Use 'npm' as the script to run
		args: 'start -p 8061',        // Arguments passed to npm (e.g., 'run start')
		instances: '1',         // Run multiple instances based on CPU cores
		exec_mode: 'fork',     // Use cluster mode for load balancing
		// env: {
		// NODE_ENV: 'development',
		// },
		//watch: true,              // Enable watching files for changes
		ignore_watch: ['node_modules', 'logs'],  // Directories to ignore

		//max_memory_restart: '500M',  // Restart if memory usage exceeds 500MB

		// env: {                    // Environment settings for development
		// 	NODE_ENV: 'development',
		// 	PORT: 8055,
		// },
		// env_production: {         // Environment settings for production
		// 	NODE_ENV: 'production',
		// 	PORT: 8055,
		// },

		log_date_format: 'YYYY-MM-DD HH:mm Z',  // Timestamp format for logs
		output: './out.log',   // Standard output log file
		error: './error.log',  // Error log file
		merge_logs: true,           // Merge logs from all instances
		//restart_delay: 50000,        // Delay between restarts in milliseconds
		//min_uptime: 10000,          // Minimum uptime before considered stable
		max_restarts: 10,           // Maximum number of restarts
		pid_file: './app.pid',      // Path to PID file
	}]
};
