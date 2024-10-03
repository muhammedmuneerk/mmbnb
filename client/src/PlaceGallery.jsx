import  { useState, useCallback } from "react";
import PropTypes from 'prop-types';
import Image from "./Image";

export default function PlaceGallery({ place }) {
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    const closeGallery = useCallback(() => {
        setShowAllPhotos(false);
        document.body.style.overflow = 'auto';
    }, []);

    const openGallery = useCallback(() => {
        setShowAllPhotos(true);
        document.body.style.overflow = 'hidden';
    }, []);

    if (!place || !place.photos || place.photos.length === 0) {
        return <div className="text-center text-gray-500">No photos available</div>;
    }

    if (showAllPhotos) {
        return (
            <div className="fixed inset-0 bg-black text-white z-50 overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center sticky top-0 bg-black py-4">
                        <h2 className="text-3xl">Photos of {place.title}</h2>
                        <button 
                            onClick={closeGallery} 
                            className="flex gap-1 py-2 px-4 rounded-2xl shadow shadow-black bg-white text-black"
                            aria-label="Close photos"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                            Close photos
                        </button>
                    </div>
                    <div className="grid gap-4 mt-8">
                        {place.photos.map((photo, index) => (
                            <div key={index} className="flex justify-center">
                                <Image 
                                    src={`${photo}`} 
                                    alt={`${place.title} - Photo ${index + 1}`}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="grid gap-2 grid-cols-[2fr_1fr] rounded-3xl overflow-hidden">
                <div>
                    {place.photos[0] && (
                        <Image 
                            onClick={openGallery} 
                            className="aspect-square cursor-pointer object-cover w-full h-full" 
                            src={`${place.photos[0]}`} 
                            alt={`${place.title} - Main Photo`}
                        />
                    )}
                </div>
                <div className="grid">
                    {place.photos[1] && (
                        <Image 
                            onClick={openGallery} 
                            className="aspect-square cursor-pointer object-cover" 
                            src={`${place.photos[1]}`} 
                            alt={`${place.title} - Photo 2`}
                        />
                    )}
                    <div className="overflow-hidden">
                        {place.photos[2] && (
                            <Image
                                onClick={openGallery} 
                                className="aspect-square cursor-pointer object-cover relative top-2" 
                                src={`${place.photos[2]}`} 
                                alt={`${place.title} - Photo 3`}
                            />
                        )}
                    </div>
                </div>
            </div>
            <button 
                onClick={openGallery} 
                className="flex gap-1 absolute bottom-2 right-2 py-2 px-4 bg-white rounded-2xl shadow-md shadow-gray-500"
                aria-label="Show more photos"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                </svg>
                Show more photos
            </button>
        </div>
    );
}

PlaceGallery.propTypes = {
    place: PropTypes.shape({
        title: PropTypes.string.isRequired,
        photos: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};