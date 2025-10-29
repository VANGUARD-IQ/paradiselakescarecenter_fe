import { gql } from '@apollo/client';

export const GET_EVENT_TASKS = gql`
  query GetEventTasks($calendarEventId: String!) {
    calendarEventTasks(calendarEventId: $calendarEventId) {
      id
      title
      description
      status
      completed
      completedAt
      completedBy
      dueDate
      order
      assignedTo
      notes
      totalChecklistItems
      completedChecklistItems
      progressPercentage
      checklistItems {
        id
        title
        completed
        completedAt
        completedBy
        order
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_EVENT_TASK = gql`
  mutation CreateEventTask($input: CalendarEventTaskInput!) {
    createCalendarEventTask(input: $input) {
      id
      title
      description
      status
      completed
      completedAt
      dueDate
      order
      assignedTo
      notes
      totalChecklistItems
      completedChecklistItems
      progressPercentage
      checklistItems {
        id
        title
        completed
        completedAt
        order
      }
    }
  }
`;

export const UPDATE_EVENT_TASK = gql`
  mutation UpdateEventTask($id: String!, $input: CalendarEventTaskInput!) {
    updateCalendarEventTask(id: $id, input: $input) {
      id
      title
      description
      status
      completed
      completedAt
      dueDate
      order
      assignedTo
      notes
      totalChecklistItems
      completedChecklistItems
      progressPercentage
      checklistItems {
        id
        title
        completed
        completedAt
        order
      }
    }
  }
`;

export const TOGGLE_TASK_COMPLETION = gql`
  mutation ToggleTaskCompletion($id: String!) {
    toggleCalendarEventTaskCompletion(id: $id) {
      id
      completed
      completedAt
      status
      progressPercentage
    }
  }
`;

export const DELETE_EVENT_TASK = gql`
  mutation DeleteEventTask($id: String!) {
    deleteCalendarEventTask(id: $id)
  }
`;

export const ADD_CHECKLIST_ITEM = gql`
  mutation AddChecklistItem($taskId: String!, $item: CalendarEventTaskChecklistItemInput!) {
    addCalendarEventTaskChecklistItem(taskId: $taskId, item: $item) {
      id
      checklistItems {
        id
        title
        completed
        completedAt
        order
      }
      totalChecklistItems
      completedChecklistItems
      progressPercentage
    }
  }
`;

export const UPDATE_CHECKLIST_ITEM = gql`
  mutation UpdateChecklistItem($input: UpdateCalendarEventTaskChecklistInput!) {
    updateCalendarEventTaskChecklistItem(input: $input) {
      id
      checklistItems {
        id
        title
        completed
        completedAt
        order
      }
      totalChecklistItems
      completedChecklistItems
      progressPercentage
      completed
      status
    }
  }
`;

export const REMOVE_CHECKLIST_ITEM = gql`
  mutation RemoveChecklistItem($taskId: String!, $checklistItemId: String!) {
    removeCalendarEventTaskChecklistItem(taskId: $taskId, checklistItemId: $checklistItemId) {
      id
      checklistItems {
        id
        title
        completed
        order
      }
      totalChecklistItems
      completedChecklistItems
      progressPercentage
    }
  }
`;

export const GET_INCOMPLETE_TASKS = gql`
  query GetIncompleteTasks($calendarId: String) {
    incompleteTasks(calendarId: $calendarId) {
      id
      title
      description
      status
      completed
      dueDate
      calendarEventId
      totalChecklistItems
      completedChecklistItems
      progressPercentage
      checklistItems {
        id
        title
        completed
        order
      }
    }
  }
`;
