import React from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Format the current month and year for display
 */
export const getMonthYearDisplay = (currentDate: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
};

/**
 * Helper function to convert time to secondary timezone
 */
export const getTimeInSecondaryTimezone = (date: Date, timezone: string): string => {
  try {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

/**
 * Helper to get the timezone city name
 */
export const getTimezoneName = (timezone: string): string => {
  return timezone.split('/').pop()?.replace('_', ' ') || timezone;
};

/**
 * Generate secondary timezone labels for the time grid
 */
export const generateSecondaryTimezoneLabels = (
  secondaryTimezone: string | null,
  calendar: any,
  is24HourView: boolean
): JSX.Element[] | null => {
  if (!secondaryTimezone || !calendar) return null;

  const labels: JSX.Element[] = [];

  // Get the actual start and end times from calendar settings or defaults
  const startTime = is24HourView ? "00:00" : (calendar.settings?.workingHoursStart || "08:00");
  const endTime = is24HourView ? "24:00" : (calendar.settings?.workingHoursEnd || "18:00");

  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  for (let hour = startHour; hour < endHour; hour++) {
    const localTime = new Date();
    localTime.setHours(hour, 0, 0, 0);

    const secondaryTime = getTimeInSecondaryTimezone(localTime, secondaryTimezone);

    labels.push(
      <Box
        key={hour}
        height="60px"
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        pr={2}
        fontSize="11px"
        fontWeight="500"
        color="cyan.400"
        borderTop={hour === startHour ? "none" : "1px solid"}
        borderColor="rgba(54, 158, 255, 0.1)"
      >
        {secondaryTime}
      </Box>
    );
  }

  return labels;
};
