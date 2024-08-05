import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Barchart.css';

// Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Barchart = () => {
    const [data, setData] = useState([]);
    const [year, setYear] = useState('2022');
    const [timezone, setTimezone] = useState('Morning');

    useEffect(() => {
        if (year && timezone) {
            axios.get(`http://localhost:5000/api/accidents/filtered`, {
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
            <h2>Accident Severity Bar Chart</h2>
            <div>
                <label>Year:
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </label>
                <label>Time Zone:
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                    </select>
                </label>
            </div>
            <Bar data={chartData} />
        </div>
    );
};

export default Barchart;
