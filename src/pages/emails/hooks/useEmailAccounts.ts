import { useQuery, gql } from '@apollo/client';

const MY_EMAIL_ACCOUNTS_QUERY = gql`
    query MyEmailAccounts {
        myEmailAddresses {
            id
            email
            name
            type
            isVerified
            associatedClients
        }
        hasAssignedEmailAddress
    }
`;

export function useEmailAccounts() {
    const { data, loading, error } = useQuery(MY_EMAIL_ACCOUNTS_QUERY, {
        fetchPolicy: 'network-only' // Force fresh data fetch
    });

    // Add debugging
    console.log('📧 useEmailAccounts hook:', {
        loading,
        error: error?.message,
        errorDetails: error,
        data,
        emailAddresses: data?.myEmailAddresses,
        count: data?.myEmailAddresses?.length,
        hasAssigned: data?.hasAssignedEmailAddress
    });

    // Log the full error if present
    if (error) {
        console.error('📧 useEmailAccounts error details:', error);
    }

    // Use either the email addresses array or the hasAssignedEmailAddress boolean
    const hasEmailAccounts = !loading && !error && (
        (data?.myEmailAddresses && data.myEmailAddresses.length > 0) ||
        data?.hasAssignedEmailAddress === true
    );
    const emailAccounts = data?.myEmailAddresses || [];
    const defaultAccount = emailAccounts[0]; // Just use the first account as default

    return {
        emailAccounts,
        defaultAccount,
        hasEmailAccounts,
        loading,
        error
    };
}