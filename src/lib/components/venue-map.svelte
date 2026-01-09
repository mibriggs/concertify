<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';

	export let longitude: number;
	export let latitude: number;
	export let venueName: string = '';

	let mapContainer: HTMLDivElement;
	let map: mapboxgl.Map;

	onMount(() => {
		const MAPBOX_TOKEN =
			'pk.eyJ1Ijoib3dhbmFydXRvIiwiYSI6ImNtMGFrOTNlNzB2dTUybG9oYTM1NTEyc20ifQ.bpgd2R46E_YcpOogQqWhpQ';

		mapboxgl.accessToken = MAPBOX_TOKEN;

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [longitude, latitude],
			zoom: 14
		});

		// Add a marker at the venue location
		new mapboxgl.Marker({ color: '#1DB954' })
			.setLngLat([longitude, latitude])
			.setPopup(
				new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(
					`<div style="
						font-weight: 600;
						font-size: 14px;
						color: #191414;
						padding: 4px 8px;
						font-family: monospace;
						border-radius: 8px;
					">${venueName || 'Venue Location'}</div>`
				)
			)
			.addTo(map);

		// Add navigation controls
		map.addControl(new mapboxgl.NavigationControl(), 'top-right');
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div bind:this={mapContainer} class="h-64 w-full rounded-lg" />

<style>
	:global(.mapboxgl-popup-close-button) {
		background-color: #ef4444;
		color: white;
		border-radius: 9999px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: 400;
		padding: 0;
		margin: 0;
		line-height: 24px;
		transition: all 0.2s;
		right: 8px;
		top: 8px;
		text-align: center;
		font-family: Arial, sans-serif;
	}

	:global(.mapboxgl-popup-close-button:hover) {
		background-color: #dc2626;
		transform: scale(1.05);
	}

	:global(.mapboxgl-popup-content) {
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding-right: 32px !important;
	}
</style>
