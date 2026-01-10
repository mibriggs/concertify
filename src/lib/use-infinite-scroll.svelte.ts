export function createInfiniteScroll(options: {
	container: () => HTMLElement | undefined;
	itemCount: () => number;
	hasMore: () => boolean;
	loadMore: () => Promise<void>;
}) {
	$effect(() => {
		const el = options.container();
		const count = options.itemCount();
		const hasMore = options.hasMore();

		console.log('[InfiniteScroll] Effect running', {
			hasContainer: !!el,
			itemCount: count,
			hasMore
		});

		if (!el || count === 0 || !hasMore) {
			console.log('[InfiniteScroll] Skipping observer setup');
			return;
		}

		const observer = new IntersectionObserver(
			async ([entry]) => {
				console.log('[InfiniteScroll] Intersection triggered', {
					isIntersecting: entry.isIntersecting
				});

				if (entry.isIntersecting) {
					console.log('[InfiniteScroll] Loading more...');
					await options.loadMore();
					console.log('[InfiniteScroll] Load complete');
				}
			},
			{ threshold: 0, rootMargin: '200px' }
		);

		const target = el.children[el.children.length - 1];
		console.log('[InfiniteScroll] Observing target', {
			targetIndex: el.children.length - 1,
			targetExists: !!target
		});

		if (target) observer.observe(target);

		return () => {
			console.log('[InfiniteScroll] Cleanup - disconnecting observer');
			observer.disconnect();
		};
	});
}
