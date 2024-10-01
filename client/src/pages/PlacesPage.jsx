import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AccountNav from "./AccountNav";
import PlaceImg from "../PlaceImg";
import './PlacesPage.css'; 


export default function PlacesPage() {
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPlaces() {
            try {
                const { data } = await axios.get('/user-places');
                setPlaces(data);
            } catch (err) {
                setError('Failed to load places. Please try again later.');
                console.error("Error fetching places:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPlaces();
    }, []);

    if (isLoading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
      <div className="m-auto">
        <AccountNav />
        <div className="text-center">
          <Link
            className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
            to="/account/places/new"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            Add new place
          </Link>
        </div>
        <div className="mt-4 mr-5">
          {places.length > 0 ? (
            places.map((place) => (
              <Link
                key={place._id}
                to={`/account/places/${place._id}`}
                className="flex cursor-pointer gap-4 bg-gray-100 p-4 rounded-2xl mb-4"
              >
                <div className="flex w-32 h-32 bg-gray-300 shrink-0 rounded-md overflow-hidden">
                  <PlaceImg
                    place={place}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grow-0 shrink">
                  <h2 className="text-xl">{place.title}</h2>
                  <p className="text-sm mt-2">{place.description}</p>
                  <p className="text-sm mt-2">{place.extraInfo}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">
              You have not added any places yet.
            </p>
          )}
        </div>
      </div>
    );
}