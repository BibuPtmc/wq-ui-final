import mapboxgl from 'mapbox-gl';

export const reverseGeocode = async (longitude, latitude) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
    );
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de l'adresse");
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      
      let address = feature.place_name || "";
      let city = "";
      let postalCode = "";
      
      if (feature.context) {
        for (const context of feature.context) {
          if (context.id.startsWith('place')) {
            city = context.text;
          } else if (context.id.startsWith('postcode')) {
            postalCode = context.text;
          }
        }
      }
      
      return {
        address,
        city,
        postalCode
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur de géocodage inverse:", error);
    throw error;
  }
};