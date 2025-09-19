import { ThemeConfig, extendTheme } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false
};

const theme = extendTheme({
    config,
    colors: {
        primary: {
            50: '#ffe7e7',
            100: '#ffbaba',
            200: '#ff8a8a',
            300: '#ff5a5a',
            400: '#ff2d2d',
            500: '#e60000',
            600: '#b30000',
            700: '#800000',
            800: '#4d0000',
            900: '#1a0000'
        },
        accent: {
            50: '#e6f7ff',
            100: '#bae7ff',
            200: '#8ad6ff',
            300: '#5ac4ff',
            400: '#2db3ff',
            500: '#0099e6',
            600: '#0077b3',
            700: '#005580',
            800: '#00334d',
            900: '#00111a'
        }
    },
    fonts: {
        heading:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    components: {
        Card: {
            baseStyle: {
                container: {
                    borderRadius: 'xl',
                    boxShadow: 'lg',
                    border: '1px solid',
                    borderColor: 'whiteAlpha.200',
                    backdropFilter: 'blur(10px)'
                }
            }
        },
        Button: {
            baseStyle: {
                fontWeight: '600',
                borderRadius: 'lg'
            },
            variants: {
                solid: {
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg'
                    },
                    _active: {
                        transform: 'translateY(0)'
                    },
                    transition: 'all 0.2s'
                },
                outline: {
                    _hover: {
                        transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s'
                }
            }
        },
        Input: {
            variants: {
                filled: {
                    field: {
                        borderRadius: 'lg',
                        bg: 'whiteAlpha.100',
                        border: '1px solid',
                        borderColor: 'whiteAlpha.200',
                        _hover: {
                            bg: 'whiteAlpha.150',
                            borderColor: 'whiteAlpha.300'
                        },
                        _focus: {
                            bg: 'whiteAlpha.200',
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 3px rgba(230, 0, 0, 0.1)'
                        }
                    }
                }
            }
        },
        Textarea: {
            variants: {
                filled: {
                    borderRadius: 'lg',
                    bg: 'whiteAlpha.100',
                    border: '1px solid',
                    borderColor: 'whiteAlpha.200',
                    _hover: {
                        bg: 'whiteAlpha.150',
                        borderColor: 'whiteAlpha.300'
                    },
                    _focus: {
                        bg: 'whiteAlpha.200',
                        borderColor: 'primary.500',
                        boxShadow: '0 0 0 3px rgba(230, 0, 0, 0.1)'
                    }
                }
            }
        }
    }
});

export default theme;
