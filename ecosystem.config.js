module.exports = {
	apps: [
		{
			name: 'byteball.oscript-editor.backend',
			script: 'bin/www',
			watch: ['./'],
			kill_timeout: 5000, // 5 sec
			env: {
				PORT: 3000,
				NODE_ENV: 'development'
			}
		}
	]
}
