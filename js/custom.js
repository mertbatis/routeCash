const startInput = document.getElementById("startLocation");
const endInput = document.getElementById("endLocation");
const startSuggestions = document.getElementById("startSuggestions");
const endSuggestions = document.getElementById("endSuggestions");

startInput.addEventListener("input", () => {
    showSuggestions(startInput, startSuggestions);
});

endInput.addEventListener("input", () => {
    showSuggestions(endInput, endSuggestions);
});

startSuggestions.addEventListener("click", (e) => {
    if (e.target.classList.contains("suggestion-item")) {
        startInput.value = e.target.textContent;
        startSuggestions.innerHTML = "";
    }
});
endSuggestions.addEventListener("click", (e) => {
    if (e.target.classList.contains("suggestion-item")) {
        endInput.value = e.target.textContent;
        endSuggestions.innerHTML = "";
    }
});

document.addEventListener("click", function (event) {
    if (!startSuggestions.contains(event.target)) {
        startSuggestions.style.display = "none";
    }
    if (!endSuggestions.contains(event.target)) {
        endSuggestions.style.display = "none";
    }
});

startInput.addEventListener("click", function (event) {
    event.stopPropagation();
    startSuggestions.style.display = "block";
});
endInput.addEventListener("click", function (event) {
    event.stopPropagation();
    endSuggestions.style.display = "block";
});

function showSuggestions(input, suggestionsDiv) {
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions(
        {
            input: input.value,
            types: ["geocode"],
        },
        (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const suggestionHTML = predictions
                    .map(prediction => `<div class="suggestion-item">${prediction.description}</div>`)
                    .join("");
                suggestionsDiv.innerHTML = suggestionHTML;
            }
        }
    );
}
function calculateFuelCost() {
    const startLocation = document.getElementById("startLocation").value;
    const endLocation = document.getElementById("endLocation").value;
    const enginePower = parseFloat(document.getElementById("enginePower").value);
    const fuelType = document.getElementById("fuelType").value;
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [startLocation],
            destinations: [endLocation],
            travelMode: 'DRIVING',
        },
        async (response, status) => {
            if (status === 'OK') {
                const distance = response.rows[0].elements[0].distance.value / 1000;
                const fuelEfficiency = calculateEstimatedFuelEfficiency(fuelType);
                const fuelPrice = await getFuelPrice(fuelType);
                const fuelCost = (distance / fuelEfficiency) * fuelPrice;
                document.getElementById("fuelCost").textContent = fuelCost.toFixed(2) + " TL";
                document.getElementById("fuelDistance").textContent = distance + " km";
                document.getElementById("result").style.display = "block";
            } else {
                alert("Uzaklık hesaplaması başarısız. Lütfen tekrar deneyin.");
            }
        }
    );
}
const apiUrl = 'https://hasanadiguzel.com.tr/api/akaryakit/sehir=ISTANBUL';

let gasolinePrice, dieselPrice, lpgPrice;
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const cityData = data.data;
        const firstDate = Object.keys(cityData)[0];
        const firstFuelPrices = cityData[firstDate];
        gasolinePrice = firstFuelPrices['Kursunsuz_95(Excellium95)_TL/lt'];
        dieselPrice = firstFuelPrices['Motorin(Excellium_Eurodiesel)_TL/lt'];
        lpgPrice = firstFuelPrices['Gazyagi_TL/lt'];
    } catch (error) {
        console.error('Veri alınamadı:', error);
    }
}
async function getFuelPrice(fuelType) {
    await fetchData();
    if (fuelType === "gasoline") {
        let pricefix = gasolinePrice.replace(",", ".");
        console.log(gasolinePrice);
        return pricefix;
    } else if (fuelType === "diesel") {
        let pricefix = dieselPrice.replace(",", ".");
        console.log(dieselPrice);
        return pricefix;
    }
    else if (fuelType === "lpg") {
        let pricefix = lpgPrice.replace(",", ".");
        return pricefix;
    }
    else if (fuelType === "electric") {
        return 0.50; // örnek bir değer, gerektiğinde değiştirilebilir
    }
    else {
        return 0.00;
    }
}
function calculateEstimatedFuelEfficiency(fuelType) {
    if (fuelType === "gasoline") {
        return 10; // ortalama bir benzinli aracın yakıt verimliliği tahmini (litre/100 km)
    } else if (fuelType === "diesel") {
        return 7; // ortalama bir dizel aracın yakıt verimliliği tahmini (litre/100 km)
    } else if (fuelType === "lpg") {
        return 12; // ortalama bir LPG aracın yakıt verimliliği tahmini (litre/100 km)
    } else if (fuelType === "electric") {
        return 2; // elektrikli veya hibrit araçlar için yakıt tüketimi yoktur (litre/100 km)
    }
    else {
        return 0;
    }
}