import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Barchart.css';

import { getApiBaseUrl } from '../utils/api';


// Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Barchart = ({ year, timezone }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (year && timezone) {
            axios.get(`${getApiBaseUrl()}/accidents/filtered`, {
                params: { year, timezone }
            })
                .then(response => {
                    console.log(response.data); // Log the response data
                    setData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [year, timezone]);

    const chartData = {
        labels: ['Mild', 'Severe', 'Fatal'],
        datasets: [{
            label: 'Accident Severity',
            data: data.length ? [data[0].mild, data[0].severe, data[0].fatal] : [0, 0, 0],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            borderWidth: 1
        }]
    };

    return (
        <div>
            <h2>Accident Severity Count</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default Barchart;
