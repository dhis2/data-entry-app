import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import PropTypes from 'prop-types'
import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    parsePeriodId,
} from '../../shared/index.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const options = {
    responsive: true,
    plugins: {
        legend: { display: false },
    },
}

function sortHistoryByStartDate(history) {
    // [...history] ->  prevent mutating the original array
    return [...history].sort((left, right) => {
        const leftStartDate = new Date(parsePeriodId(left.period).startDate)
        const rightStartDate = new Date(parsePeriodId(right.period).startDate)

        if (leftStartDate > rightStartDate) {
            return 1
        }

        if (leftStartDate < rightStartDate) {
            return -1
        }

        return 0
    })
}

function createLabelsFromHistory(history) {
    return history.map(
        ({ period }) => parsePeriodId(period).displayName
    )
}

export default function HistoryLineChart({ history }) {
    const oldToNewHistory = sortHistoryByStartDate(history)
    const labels = createLabelsFromHistory(oldToNewHistory)
    const data = {
        labels,
        datasets: [
            {
                label: '',
                data: oldToNewHistory.map(({ value }) => Number(value)),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    }

    return <Line options={options} data={data} />
}

HistoryLineChart.propTypes = {
    history: PropTypes.arrayOf(
        PropTypes.shape({
            period: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        })
    ),
}
