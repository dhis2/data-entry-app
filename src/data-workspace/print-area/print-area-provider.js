import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import PrintAreaContext from './print-area-context.js'
import styles from './print-area-provider.module.css'

export default function PrintAreaProvider({ children }) {
    const [formPrinting, setPrinting] = useState(null)
    const [formCleared, setFormCleared] = useState(null)

    useEffect(() => {
        if (formPrinting) {
            window.print()
        }
        // cleanup function, which is ran before running the effect next time, so it makes sure the state is reset
        return () => {
            setPrinting(false)
            setFormCleared(false)
        }
    }, [formPrinting, formCleared])

    const printForm = (isEmptyForm = false) => {
        setFormCleared(isEmptyForm)
        setPrinting(true)
    }

    const value = {
        formPrinting,
        printForm,
    }

    return (
        <PrintAreaContext.Provider value={value}>
            <div
                className={cx(
                    styles.printAreaProvider,
                    formCleared && 'form-cleared'
                )}
            >
                {children}
            </div>
        </PrintAreaContext.Provider>
    )
}

PrintAreaProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
