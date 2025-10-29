import React from 'react';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { getColor } from '../../../../brandConfig';

interface TimelineRulerProps {
  birthDate: Date;
  endDate: Date;
  zoomConfig: any;
  totalHeight: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  birthDate,
  endDate,
  zoomConfig,
  totalHeight,
}) => {
  const { colorMode } = useColorMode();

  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  const renderAgeMarkers = () => {
    const markers: JSX.Element[] = [];
    const currentYear = new Date().getFullYear();
    const birthYear = birthDate.getFullYear();

    // Show age markers every year
    for (let age = 0; age <= 120; age++) {
      const ageDate = new Date(birthDate);
      ageDate.setFullYear(birthDate.getFullYear() + age);

      const daysSinceBirth = Math.floor(
        (ageDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const position = daysSinceBirth * zoomConfig.pixelsPerDay;

      // Show every year, but highlight every 5 or 10 years depending on zoom
      const isMajor = age % 10 === 0;
      const isMinor = age % 5 === 0 && !isMajor;
      const isCurrentAge = birthYear + age === currentYear;

      // Only show labels for major/minor markers or current age, depending on zoom
      const shouldShowLabel = isMajor || (zoomConfig.pixelsPerDay >= 0.1 && isMinor) || isCurrentAge;

      if (shouldShowLabel || isMajor) {
        markers.push(
          <Box
            key={age}
            position="absolute"
            top={`${position}px`}
            left="0"
            right="0"
            borderTop="1px solid"
            borderColor={
              isCurrentAge
                ? 'blue.500'
                : isMajor
                ? cardBorder
                : `${cardBorder}30`
            }
          >
            {shouldShowLabel && (
              <Text
                position="absolute"
                right="4px"
                top="-10px"
                fontSize={isMajor ? 'xs' : '2xs'}
                fontWeight={isMajor || isCurrentAge ? 'bold' : 'normal'}
                color={
                  isCurrentAge
                    ? 'blue.500'
                    : isMajor
                    ? textPrimary
                    : textMuted
                }
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                px={1}
              >
                {age}
              </Text>
            )}
          </Box>
        );
      }
    }

    return markers;
  };

  const renderMarkers = () => {
    const markers: JSX.Element[] = [];
    const { rulerUnit } = zoomConfig;

    let currentDate = new Date(birthDate);
    let index = 0;

    while (currentDate <= endDate) {
      const daysSinceBirth = Math.floor(
        (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const position = daysSinceBirth * zoomConfig.pixelsPerDay;

      let label = '';
      let isMajor = false;
      const nextDate = new Date(currentDate);

      switch (rulerUnit) {
        case 'decade':
          if (currentDate.getFullYear() % 10 === 0) {
            label = currentDate.getFullYear().toString();
            isMajor = true;
          }
          nextDate.setFullYear(currentDate.getFullYear() + 1);
          break;

        case 'year':
          label = currentDate.getFullYear().toString();
          isMajor = currentDate.getFullYear() % 5 === 0;
          nextDate.setFullYear(currentDate.getFullYear() + 1);
          break;

        case 'quarter':
          const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
          label = `Q${quarter} ${currentDate.getFullYear()}`;
          isMajor = quarter === 1;
          nextDate.setMonth(currentDate.getMonth() + 3);
          break;

        case 'month':
          label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          isMajor = currentDate.getMonth() === 0;
          nextDate.setMonth(currentDate.getMonth() + 1);
          break;

        case 'week':
          label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          isMajor = currentDate.getDate() === 1;
          nextDate.setDate(currentDate.getDate() + 7);
          break;

        case 'day':
          label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          isMajor = currentDate.getDate() === 1;
          nextDate.setDate(currentDate.getDate() + 1);
          break;
      }

      if (label) {
        markers.push(
          <Box
            key={index}
            position="absolute"
            top={`${position}px`}
            left="0"
            right="0"
            borderTop="1px solid"
            borderColor={isMajor ? cardBorder : `${cardBorder}50`}
          >
            <Text
              position="absolute"
              left="4px"
              top="-10px"
              fontSize={isMajor ? 'xs' : '2xs'}
              fontWeight={isMajor ? 'bold' : 'normal'}
              color={isMajor ? textPrimary : textMuted}
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              px={1}
            >
              {label}
            </Text>
          </Box>
        );
      }

      currentDate = nextDate;
      index++;
    }

    return markers;
  };

  return (
    <Box display="flex">
      {/* Age Ruler */}
      <Box
        position="relative"
        w="60px"
        minH={`${totalHeight}px`}
        borderRight="1px solid"
        borderColor={cardBorder}
        bg={colorMode === 'light' ? 'gray.100' : 'gray.950'}
      >
        <Text
          position="sticky"
          top="0"
          fontSize="2xs"
          fontWeight="bold"
          color={textMuted}
          textAlign="center"
          py={1}
          bg={colorMode === 'light' ? 'gray.100' : 'gray.950'}
          borderBottom="1px solid"
          borderColor={cardBorder}
          zIndex={10}
        >
          AGE
        </Text>
        {renderAgeMarkers()}
      </Box>

      {/* Date Ruler */}
      <Box
        position="relative"
        w="100px"
        minH={`${totalHeight}px`}
        borderRight="2px solid"
        borderColor={cardBorder}
        bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
      >
        <Text
          position="sticky"
          top="0"
          fontSize="2xs"
          fontWeight="bold"
          color={textMuted}
          textAlign="center"
          py={1}
          bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
          borderBottom="1px solid"
          borderColor={cardBorder}
          zIndex={10}
        >
          DATE
        </Text>
        {renderMarkers()}
      </Box>
    </Box>
  );
};