import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SubscriptionOffers from '../pages/profile/SubscriptionOffers';
import { gql } from '@apollo/client';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn()
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// GraphQL Queries
const GET_TENANT_CONFIG = gql`
    query GetTenantConfig($id: ID!) {
        tenant(id: $id) {
            id
            apiKeys {
                stripePublicKey
            }
        }
    }
`;

const GET_CLIENT_SUBSCRIPTIONS = gql`
    query GetClientSubscriptions {
        mySubscriptions {
            id
            planId
            status
            nextBillingDate
            canceledAt
            stripeSubscriptionId
        }
    }
`;

const CREATE_SUBSCRIPTION = gql`
    mutation CreateSubscription($input: SubscriptionInput!) {
        createSubscription(input: $input) {
            id
            status
            stripeSubscriptionId
            clientSecret
            stripeCustomerId
            nextBillingDate
            client {
                id
                email
            }
            plan {
                name
                amount
                interval
            }
        }
    }
`;

describe('SubscriptionOffers Component', () => {
    const mockStripePromise = Promise.resolve({
        elements: jest.fn(() => ({
            create: jest.fn(),
            getElement: jest.fn(() => ({
                on: jest.fn(),
                off: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                destroy: jest.fn()
            }))
        })),
        createPaymentMethod: jest.fn(),
        confirmCardPayment: jest.fn()
    });

    beforeEach(() => {
        (loadStripe as jest.Mock).mockReturnValue(mockStripePromise);
        mockNavigate.mockClear();
    });

    const renderWithProviders = (component: React.ReactElement, mocks: any[] = []) => {
        return render(
            <BrowserRouter>
                <ChakraProvider>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        {component}
                    </MockedProvider>
                </ChakraProvider>
            </BrowserRouter>
        );
    };

    describe('Initial Loading States', () => {
        it('should show loading spinner while fetching tenant config', () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        loading: true
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            expect(screen.getByText(/Loading payment configuration/i)).toBeInTheDocument();
        });

        it('should show error if tenant config fails to load', async () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    error: new Error('Failed to load tenant')
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                expect(screen.getByText(/Error loading payment configuration/i)).toBeInTheDocument();
            });
        });

        it('should show warning if Stripe is not configured', async () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: null
                                }
                            }
                        }
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                expect(screen.getByText(/Stripe not configured/i)).toBeInTheDocument();
            });
        });
    });

    describe('Subscription Plans Display', () => {
        const defaultMocks = [
            {
                request: {
                    query: GET_TENANT_CONFIG,
                    variables: { id: '684d0930cc7a27bb01ac83ce' }
                },
                result: {
                    data: {
                        tenant: {
                            id: '684d0930cc7a27bb01ac83ce',
                            apiKeys: {
                                stripePublicKey: 'pk_test_123'
                            }
                        }
                    }
                }
            },
            {
                request: {
                    query: GET_CLIENT_SUBSCRIPTIONS
                },
                result: {
                    data: {
                        mySubscriptions: []
                    }
                }
            }
        ];

        it('should display all subscription plans', async () => {
            renderWithProviders(<SubscriptionOffers />, defaultMocks);
            
            await waitFor(() => {
                expect(screen.getByText('Daily Dollar Plan')).toBeInTheDocument();
                expect(screen.getByText('Weekly Special')).toBeInTheDocument();
                expect(screen.getByText('Monthly Pro')).toBeInTheDocument();
            });
        });

        it('should show recommended badge on daily plan', async () => {
            renderWithProviders(<SubscriptionOffers />, defaultMocks);
            
            await waitFor(() => {
                const dailyPlanCard = screen.getByText('Daily Dollar Plan').closest('[role="group"]');
                expect(dailyPlanCard?.querySelector('text')?.textContent).toContain('RECOMMENDED');
            });
        });

        it('should display correct pricing for each plan', async () => {
            renderWithProviders(<SubscriptionOffers />, defaultMocks);
            
            await waitFor(() => {
                expect(screen.getByText('$1')).toBeInTheDocument();
                expect(screen.getByText('$5')).toBeInTheDocument();
                expect(screen.getByText('$20')).toBeInTheDocument();
            });
        });
    });

    describe('Subscription Creation Flow', () => {
        const stripe = {
            elements: jest.fn(() => ({
                create: jest.fn(),
                getElement: jest.fn(() => ({
                    on: jest.fn(),
                    off: jest.fn(),
                    mount: jest.fn(),
                    unmount: jest.fn(),
                    destroy: jest.fn()
                }))
            })),
            createPaymentMethod: jest.fn(() => Promise.resolve({
                paymentMethod: { id: 'pm_test_123' }
            })),
            confirmCardPayment: jest.fn(() => Promise.resolve({
                paymentIntent: { status: 'succeeded' }
            }))
        };

        beforeEach(() => {
            (loadStripe as jest.Mock).mockReturnValue(Promise.resolve(stripe));
        });

        it('should open checkout modal when Get Started is clicked', async () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: 'pk_test_123'
                                }
                            }
                        }
                    }
                },
                {
                    request: {
                        query: GET_CLIENT_SUBSCRIPTIONS
                    },
                    result: {
                        data: {
                            mySubscriptions: []
                        }
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                const getStartedButtons = screen.getAllByText('Get Started');
                fireEvent.click(getStartedButtons[0]);
            });

            await waitFor(() => {
                expect(screen.getByText('Subscribe to Daily Dollar Plan')).toBeInTheDocument();
            });
        });

        it('should create subscription and confirm payment', async () => {
            const createSubMock = {
                request: {
                    query: CREATE_SUBSCRIPTION,
                    variables: {
                        input: {
                            clientId: 'current',
                            plan: {
                                name: 'Daily Dollar Plan',
                                description: 'Perfect for testing and getting started',
                                amount: 100,
                                interval: 'DAILY',
                                tier: 'BASIC'
                            },
                            paymentMethodId: 'pm_test_123'
                        }
                    }
                },
                result: {
                    data: {
                        createSubscription: {
                            id: 'sub_123',
                            status: 'ACTIVE',
                            stripeSubscriptionId: 'sub_stripe_123',
                            clientSecret: 'pi_test_secret',
                            stripeCustomerId: 'cus_123',
                            nextBillingDate: '2024-01-02',
                            client: {
                                id: 'client_123',
                                email: 'test@example.com'
                            },
                            plan: {
                                name: 'Daily Dollar Plan',
                                amount: 100,
                                interval: 'DAILY'
                            }
                        }
                    }
                }
            };

            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: 'pk_test_123'
                                }
                            }
                        }
                    }
                },
                {
                    request: {
                        query: GET_CLIENT_SUBSCRIPTIONS
                    },
                    result: {
                        data: {
                            mySubscriptions: []
                        }
                    }
                },
                createSubMock
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            // Wait for plans to load and click Get Started
            await waitFor(() => {
                const getStartedButtons = screen.getAllByText('Get Started');
                fireEvent.click(getStartedButtons[0]);
            });

            // Modal should open
            await waitFor(() => {
                expect(screen.getByText('Subscribe to Daily Dollar Plan')).toBeInTheDocument();
            });

            // Simulate form submission
            const subscribeButton = screen.getByRole('button', { name: /Subscribe Now/i });
            
            await waitFor(async () => {
                fireEvent.click(subscribeButton);
            });

            // Verify Stripe methods were called
            await waitFor(() => {
                expect(stripe.createPaymentMethod).toHaveBeenCalled();
                expect(stripe.confirmCardPayment).toHaveBeenCalledWith('pi_test_secret');
            });

            // Verify navigation to subscriptions page
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/profile/subscriptions');
            }, { timeout: 3000 });
        });

        it('should show error if payment method creation fails', async () => {
            stripe.createPaymentMethod.mockRejectedValueOnce(new Error('Card declined'));

            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: 'pk_test_123'
                                }
                            }
                        }
                    }
                },
                {
                    request: {
                        query: GET_CLIENT_SUBSCRIPTIONS
                    },
                    result: {
                        data: {
                            mySubscriptions: []
                        }
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                const getStartedButtons = screen.getAllByText('Get Started');
                fireEvent.click(getStartedButtons[0]);
            });

            const subscribeButton = screen.getByRole('button', { name: /Subscribe Now/i });
            fireEvent.click(subscribeButton);

            await waitFor(() => {
                expect(screen.getByText(/Payment Method Error/i)).toBeInTheDocument();
            });
        });
    });

    describe('Existing Subscriptions', () => {
        it('should show existing subscriptions alert', async () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: 'pk_test_123'
                                }
                            }
                        }
                    }
                },
                {
                    request: {
                        query: GET_CLIENT_SUBSCRIPTIONS
                    },
                    result: {
                        data: {
                            mySubscriptions: [
                                {
                                    id: 'sub_123',
                                    planId: 'daily_dollar',
                                    status: 'ACTIVE',
                                    nextBillingDate: '2024-01-02',
                                    canceledAt: null,
                                    stripeSubscriptionId: 'sub_stripe_123'
                                }
                            ]
                        }
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                expect(screen.getByText(/You have active subscriptions/i)).toBeInTheDocument();
            });
        });

        it('should disable Get Started for active subscriptions', async () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: 'pk_test_123'
                                }
                            }
                        }
                    }
                },
                {
                    request: {
                        query: GET_CLIENT_SUBSCRIPTIONS
                    },
                    result: {
                        data: {
                            mySubscriptions: [
                                {
                                    id: 'sub_123',
                                    planId: 'daily_dollar',
                                    status: 'ACTIVE',
                                    nextBillingDate: '2024-01-02',
                                    canceledAt: null,
                                    stripeSubscriptionId: 'sub_stripe_123'
                                }
                            ]
                        }
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                const activeButton = screen.getByText('Currently Active');
                expect(activeButton).toBeInTheDocument();
                expect(activeButton.closest('button')).toBeDisabled();
            });
        });
    });

    describe('Test Mode Indicator', () => {
        it('should show test mode notice for test Stripe keys', async () => {
            const mocks = [
                {
                    request: {
                        query: GET_TENANT_CONFIG,
                        variables: { id: '684d0930cc7a27bb01ac83ce' }
                    },
                    result: {
                        data: {
                            tenant: {
                                id: '684d0930cc7a27bb01ac83ce',
                                apiKeys: {
                                    stripePublicKey: 'pk_test_123'
                                }
                            }
                        }
                    }
                },
                {
                    request: {
                        query: GET_CLIENT_SUBSCRIPTIONS
                    },
                    result: {
                        data: {
                            mySubscriptions: []
                        }
                    }
                }
            ];

            renderWithProviders(<SubscriptionOffers />, mocks);
            
            await waitFor(() => {
                expect(screen.getByText(/Test Mode Active/i)).toBeInTheDocument();
                expect(screen.getByText(/4242 4242 4242 4242/i)).toBeInTheDocument();
            });
        });
    });
});