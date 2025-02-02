import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatedHeader } from './components/AnimatedHeader';
import BusCard from './components/BusCard';
import Maps from './pages/Maps';
import routesData from './assets/routes.json';

function App() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        // Get all images from the public/images directory at build time
        const busImages = import.meta.glob('/public/images/**/*.jpg', { eager: true });

        const mappedBuses = routesData.map(bus => {
            const imagePath = `/images/${bus.dataset_id}/${bus.bus_number}.jpg`;
            // Get the full public path that would match our image
            const fullImagePath = `/public/images/${bus.dataset_id}/${bus.bus_number}.jpg`;

            // Only set imageUrl if we explicitly find the image in our glob
            const imageUrl = Object.keys(busImages).includes(fullImagePath) ? imagePath : null;

            return {
                ...bus,
                imageUrl,
                route: bus.geom
            };
        });

        // Separate buses with and without images
        const busesWithImages = mappedBuses.filter(bus => bus.imageUrl);
        const busesWithoutImages = mappedBuses.filter(bus => !bus.imageUrl);

        // Take only first 20 buses without images
        const limitedBusesWithoutImages = busesWithoutImages.slice(0, 20);

        // Combine and set the buses
        setBuses([...busesWithImages, ...limitedBusesWithoutImages]);
    }, []);

    return (
        <BrowserRouter basename="/vite_bus">
            <Routes>
                <Route path="/maps" element={<Maps />} />
                <Route path="/" element={
                    <div className="relative min-h-screen py-5 w-screen overflow-hidden">
                        <div className="fixed inset-0 w-screen h-screen bg-repeat filter grayscale-90 brightness-110 -z-10"
                            style={{
                                backgroundImage: 'url(./images/background.jpg)',
                                backgroundSize: '400px'
                            }}>
                        </div>
                        <div className="max-w-7xl mx-auto py-4 bg-white/90 rounded-lg px-5">
                            <AnimatedHeader>
                                RUPERT&apos;S BEST BUS WEBSITE EVER!
                            </AnimatedHeader>

                            <Link
                                to="/maps"
                                className="inline-block px-4 py-2 mb-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Go to Big Map
                            </Link>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {buses.map((bus) => (
                                    <div key={`${bus.dataset_id}-${bus.bus_number}`}>
                                        <BusCard
                                            busNumber={bus.bus_number}
                                            operatorName={bus.operator_name}
                                            imageUrl={bus.imageUrl}
                                            route={bus.route}
                                            datasetId={bus.dataset_id}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;