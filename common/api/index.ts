import axios from "axios"

axios.defaults.baseURL = "https://backend-restapi.hacerpedido.com:5001"
axios.defaults.headers.common["Content-Type"] = "application/json"
