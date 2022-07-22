import { useOnlineStatus } from '@dhis2/app-runtime'

/*
 * This can be used to mock the connection status.
 * That way the entire UI can be tested with "offine: false",
 * instead of setting a local variable in many components
 */
export default function useConnectionStatus() {
    return useOnlineStatus()
}
