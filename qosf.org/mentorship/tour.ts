
// Declare Driver.js global (loaded via CDN)
declare const driver: any;

interface TourStep {
    element?: string;
    popover: {
        title: string;
        description: string;
        side?: string;
        align?: string;
    };
    onHighlightStarted?: (element?: Element, step?: any, options?: any) => void;
}

class MetriqTour {
    private driverObj: any;

    constructor() {
        // Fix for Driver.js CDN potentially namespacing the constructor
        const driverConstructor = (window as any).driver?.js?.driver || (window as any).driver;
        
        if (!driverConstructor) {
            console.error("MetriqTour: Driver.js not loaded");
            return;
        }

        this.driverObj = driverConstructor({
            showProgress: true,
            animate: true,
            steps: this.getSteps(),
            doneBtnText: 'Done',
            closeBtnText: 'Close',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
        });
    }

    private getSteps(): TourStep[] {
        return [
            {
                element: '.brand',
                popover: {
                    title: 'Welcome to Metriq',
                    description: 'The community-driven platform for benchmarking quantum hardware and compilers. Navigate the performance landscape.',
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '.tabs--views',
                popover: {
                    title: 'Primary Navigation',
                    description: 'Switch between the high-level platform leaderboard, explore individual benchmark results, and read benchmark definitions',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '#view-platforms-btn',
                popover: {
                    title: 'Platform Leaderboard',
                    description: 'Compare global quantum systems using the aggregated Metriq Score—a normalized performance metric across diverse architectures. <a href="#view=platforms&help=metriq-score">Learn more</a>',
                    side: 'bottom',
                    align: 'center'
                },
                onHighlightStarted: () => {
                   window.scrollTo({ top: 0, behavior: 'auto' });
                   document.getElementById('view-platforms-btn')?.click();
                   void document.body.offsetHeight; // Force reflow
                }
            },
             {
                element: '#platforms-container', // Target container instead of table to be safer
                popover: {
                    title: 'Device Specifications',
                    description: 'At a glance view of perfomance across providers and devices, as well as information on recent benchmark data contributions.',
                    side: 'top',
                    align: 'center'
                },
                 onHighlightStarted: () => {
                   document.getElementById('view-platforms-btn')?.click();
                   void document.body.offsetHeight;
                }
            },
            {
                element: '.link-platforms-json',
                popover: {
                    title: 'Platforms Index JSON',
                    description: 'Download a JSON view of the high-level platform data',
                    side: 'left',
                    align: 'center'
                },
                onHighlightStarted: () => {
                    document.getElementById('view-platforms-btn')?.click();
                }
            },
            {
                element: '#view-results-btn',
                popover: {
                    title: 'Benchmark Analysis',
                    description: 'Explore granular individual benchmark results from the community-contributed metriq dataset',
                    side: 'bottom',
                    align: 'center'
                },
                onHighlightStarted: () => {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    document.getElementById('view-results-btn')?.click();
                    void document.body.offsetHeight; // Force reflow
                }
            },
            {
                element: '#panel-graph', // Target the graph panel
                popover: {
                    title: 'Performance Trends',
                    description: 'Visualize benchmark and provider performance over time',
                    side: 'left',
                    align: 'center'
                },
                onHighlightStarted: () => {
                    document.getElementById('view-results-btn')?.click();
                    document.getElementById('tab-graph')?.click();
                    void document.body.offsetHeight;
                }
            },
            {
                element: '.smart-controls',
                popover: {
                    title: 'Parametric Filtering',
                    description: 'Isolate specific variables. Slice the dataset by cloud provider, device, or benchmark protocol.',
                    side: 'bottom',
                    align: 'center'
                },
                onHighlightStarted: () => {
                    document.getElementById('view-results-btn')?.click();
                    document.getElementById('tab-table')?.click(); // Filter step needs table view
                    void document.body.offsetHeight;
                }
            },
            {
                popover: {
                    title: 'Result Deep Dive',
                    description: 'Click on any row in the table to see more details about the Device, job parameters, and raw results.',
                    side: 'bottom',
                    align: 'center'
                },
                onHighlightStarted: () => {
                    document.getElementById('view-results-btn')?.click();
                    document.getElementById('tab-table')?.click();
                    void document.body.offsetHeight;
                }
            },
            {
                element: '#view-benchmarks-btn',
                popover: {
                    title: 'Benchmark Definitions',
                    description: 'Reference the Metriq Gym documentation to understand benchmark definitions and parameters.',
                    side: 'bottom',
                    align: 'center'
                },
                onHighlightStarted: () => {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    document.getElementById('view-benchmarks-btn')?.click();
                    void document.body.offsetHeight;
                }
            },
            {
                element: '.brand', // Back to start/neutral
                popover: {
                    title: 'Start Exploring',
                    description: "You are ready to analyze the state of the art. Restart this tour via the 'Take a tour' button at any time.",
                    side: 'bottom',
                    align: 'start'
                },
                onHighlightStarted: () => {
                     // Reset to default view at the end? Or leave them where they are.
                     // Let's go back to platforms as it's the "home" view.
                     document.getElementById('view-platforms-btn')?.click();
                }
            }
        ];
    }

    public start() {
        if (!this.driverObj) return;
        this.driverObj.drive();
    }


}

// Global instance to be used by main.ts or inline script
(window as any).MetriqTour = MetriqTour;
