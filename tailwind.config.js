/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				spotigreen: '#1DB954',
				spotiblack: '#191414'
			},
			backgroundImage: {
				search: "url('$lib/assets/search.svg')"
			},
			backgroundPosition: {
				'left-center': 'left 2% bottom 50%'
			}
		}
	},
	plugins: []
};
