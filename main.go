package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type flight struct {
	To          string `json:"to"`
	From        string `json:"from"`
	TravelClass string `json:"travelClass"`
}

type FlightResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Itineraries struct {
			TopFlights []struct {
				DepartureTime string `json:"departure_time"`
				ArrivalTime   string `json:"arrival_time"`
				Duration      struct {
					Raw  int    `json:"raw"`
					Text string `json:"text"`
				} `json:"duration"`
				Price       int    `json:"price"`
				AirlineLogo string `json:"airline_logo"`
				Stops       int    `json:"stops"`
				Flights     []struct {
					Airline      string `json:"airline"`
					FlightNumber string `json:"flight_number"`
					Aircraft     string `json:"aircraft"`
				} `json:"flights"`
			} `json:"topFlights"`
		} `json:"itineraries"`
	} `json:"data"`
}

type FlightResult struct {
	DepartureTime string `json:"departure_time"`
	ArrivalTime   string `json:"arrival_time"`
	Duration      string `json:"duration"`
	Price         int    `json:"price"`
	Airline       string `json:"airline"`
	FlightNumber  string `json:"flight_number"`
	Stops         string `json:"stops"`
}

func getPrice(plane flight) []FlightResult {
	url := fmt.Sprintf("https://google-flights2.p.rapidapi.com/api/v1/searchFlights?departure_id=%s&outbound_date=2025-08-13&arrival_id=%s&travel_class=%s&adults=1&show_hidden=1&currency=USD&language_code=en-US&country_code=US&search_type=best", plane.From, plane.To, plane.TravelClass)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return nil
	}

	req.Header.Add("x-rapidapi-key", "f1335a225amsh6f3e7a4247969a0p13e94ejsndd15b043f464")
	req.Header.Add("x-rapidapi-host", "google-flights2.p.rapidapi.com")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		return nil
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Printf("Error reading body: %v\n", err)
		return nil
	}

	var flightData FlightResponse

	var results []FlightResult
	err = json.Unmarshal(body, &flightData)
	if err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		return nil
	}

	if len(flightData.Data.Itineraries.TopFlights) == 0 {
		fmt.Println("No flights found")
		return nil
	}

	for i, flight := range flightData.Data.Itineraries.TopFlights {
		if i >= 10 {
			break
		}

		var stops string
		if flight.Stops > 0 {
			stops = fmt.Sprintf("%d stop(s)", flight.Stops)
		} else {
			stops = "Non-stop"
		}

		result := FlightResult{
			DepartureTime: flight.DepartureTime,
			ArrivalTime:   flight.ArrivalTime,
			Duration:      flight.Duration.Text,
			Price:         flight.Price,
			Airline:       flight.Flights[0].Airline,
			FlightNumber:  flight.Flights[0].FlightNumber,
			Stops:         stops,
		}
		results = append(results, result)
	}

	return results
}
func HandleSearch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers",
		"Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed",
			http.StatusMethodNotAllowed)
		return
	}

	var reqFlight flight
	if err := json.NewDecoder(r.Body).Decode(&reqFlight); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	results := getPrice(reqFlight)
	w.Header().Set("Content-Type",
		"application/json")
	json.NewEncoder(w).Encode(results)
}
func HandleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(`<h1>Go Flight API is running!</h1>
	<p>Use /search endpoint</p>`))
}

func main() {

	http.HandleFunc("/", HandleIndex)
	http.HandleFunc("/search", HandleSearch)
	fmt.Println("Server starting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}
