// Type definitions for subscription helpers
type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "PAUSED" | "INCOMPLETE";
type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";

interface StatusMap {
    [key: string]: string;
}

export const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase()
    }).format(amount);
};

export const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

export const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const getSubscriptionStatusDisplay = (status: string) => {
    const statusMap: StatusMap = {
        ACTIVE: "Active",
        CANCELED: "Canceled",
        PAST_DUE: "Past Due",
        TRIALING: "Trial",
        PAUSED: "Paused",
        INCOMPLETE: "Incomplete"
    };
    return statusMap[status] || status;
};

export const getInvoiceStatusDisplay = (status: string) => {
    const statusMap: StatusMap = {
        DRAFT: "Draft",
        OPEN: "Open",
        PAID: "Paid",
        VOID: "Void",
        UNCOLLECTIBLE: "Uncollectible"
    };
    return statusMap[status] || status;
};

export const calculateDaysUntilDue = (dueDate: string | Date) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const isOverdue = (dueDate: string | Date) => {
    return calculateDaysUntilDue(dueDate) < 0;
};

export const getPlanDisplayName = (plan: any) => {
    if (!plan) return "No Plan";
    return `${plan.name} - ${formatCurrency(plan.amount)}/${plan.interval.toLowerCase()}`;
};

export const calculateTax = (subtotal: number, taxRate: number) => {
    return subtotal * (taxRate / 100);
};

export const calculateTotal = (subtotal: number, taxAmount: number = 0, discountAmount: number = 0) => {
    return subtotal + taxAmount - discountAmount;
};

export const generateInvoiceNumber = (prefix: string = "INV", startNumber: number = 1000, currentCount: number = 0) => {
    return `${prefix}-${startNumber + currentCount}`;
};