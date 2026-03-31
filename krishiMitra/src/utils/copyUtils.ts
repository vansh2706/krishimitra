/**
 * Utility functions for copying text to clipboard with visual feedback
 */

/**
 * Copy text to clipboard using the modern Clipboard API with fallback to execCommand
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves when copy operation is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        // Try modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback to document.execCommand for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

/**
 * Select all text in a temporary textarea and copy it to clipboard
 * Provides visual feedback through a callback function
 * @param text - The text to copy
 * @param onFeedback - Callback function to provide visual feedback (e.g., change button text)
 * @returns Promise that resolves when copy operation is complete
 */
export async function selectAllAndCopy(
    text: string,
    onFeedback?: (isCopying: boolean) => void
): Promise<boolean> {
    try {
        // Trigger visual feedback
        if (onFeedback) onFeedback(true);

        const success = await copyToClipboard(text);

        // Reset visual feedback after delay
        if (onFeedback) {
            setTimeout(() => onFeedback(false), 1500);
        }

        return success;
    } catch (err) {
        console.error('Failed to select and copy text: ', err);
        // Reset visual feedback on error
        if (onFeedback) onFeedback(false);
        return false;
    }
}

/**
 * Format pest detection result for copying
 * @param result - Pest detection result object
 * @param language - Current language
 * @returns Formatted text string
 */
export function formatPestDetectionResult(result: any, language: string): string {
    return `${result.pestName}
${result.description}

${language === 'hi' ? 'गंभीरता' : 'Severity'}: ${(result?.severity || 'unknown').toUpperCase()}
${language === 'hi' ? 'विश्वसनीयता' : 'Confidence'}: ${result.confidence}%`;
}

/**
 * Format symptoms for copying
 * @param symptoms - Array of symptoms
 * @returns Formatted text string
 */
export function formatSymptoms(symptoms: string[]): string {
    return symptoms?.join('\n') || '';
}

/**
 * Format treatments for copying
 * @param treatments - Array of treatments
 * @returns Formatted text string
 */
export function formatTreatments(treatments: string[]): string {
    return treatments?.join('\n') || '';
}

/**
 * Format prevention strategies for copying
 * @param prevention - Array of prevention strategies
 * @returns Formatted text string
 */
export function formatPrevention(prevention: string[]): string {
    return prevention?.join('\n') || '';
}

/**
 * Format affected crops for copying
 * @param crops - Array of affected crops
 * @returns Formatted text string
 */
export function formatAffectedCrops(crops: string[]): string {
    return crops?.join(', ') || '';
}

/**
 * Format market prices for copying
 * @param prices - Array of price objects
 * @param getCropNameInLanguage - Function to get crop name in current language
 * @param formatCurrency - Function to format currency
 * @param language - Current language
 * @returns Formatted text string
 */
export function formatMarketPrices(
    prices: any[],
    getCropNameInLanguage: (crop: string) => string,
    formatCurrency: (amount: number) => string,
    language: string
): string {
    let text = `${language === 'hi' ? 'वर्तमान मूल्य सूची' : 'Current Price List'}\n\n`;
    text += prices.map(price =>
        `${getCropNameInLanguage(price.crop)} (${price.variety}) - ${formatCurrency(price.price)} ${language === 'hi' ? 'प्रति क्विंटल' : 'per quintal'} (${price.market})`
    ).join('\n');
    return text;
}

/**
 * Format cost-benefit analysis for copying
 * @param analysis - Analysis object
 * @param formatCurrency - Function to format currency
 * @param language - Current language
 * @returns Formatted text string
 */
export function formatCostBenefitAnalysis(
    analysis: any,
    formatCurrency: (amount: number) => string,
    language: string
): string {
    return `${language === 'hi' ? 'लागत-लाभ विश्लेषण' : 'Cost-Benefit Analysis'}

${language === 'hi' ? 'औसत बाजार मूल्य' : 'Average Market Price'}: ${formatCurrency(analysis.avgPrice)} ${language === 'hi' ? 'प्रति क्विंटल' : 'per quintal'}
${language === 'hi' ? 'उत्पादन लागत' : 'Production Cost'}: ${formatCurrency(analysis.productionCost)} ${language === 'hi' ? 'प्रति क्विंटल' : 'per quintal'}
${language === 'hi' ? 'लाभ प्रति क्विंटल' : 'Profit per Quintal'}: ${formatCurrency(analysis.profitPerQuintal)} (${((analysis.profitPerQuintal / analysis.avgPrice) * 100).toFixed(1)}% ${language === 'hi' ? 'मार्जिन' : 'margin'})
${language === 'hi' ? 'लाभ प्रति एकड़' : 'Profit per Acre'}: ${formatCurrency(analysis.profitPerAcre)} (${language === 'hi' ? 'अनुमानित' : 'estimated'})

${language === 'hi' ? 'सुझाव:' : 'Recommendation:'} ${analysis.profitPerQuintal > 1000 ?
            (language === 'hi' ? 'अच्छा लाभ मार्जिन! यह फसल लगाना लाभदायक हो सकता है।' : 'Good profit margin! This crop could be profitable to grow.') :
            (language === 'hi' ? 'कम लाभ मार्जिन। बाजार की स्थिति की जांच करें या अन्य फसलों पर विचार करें।' : 'Low profit margin. Check market conditions or consider other crops.')}`;
}

/**
 * Format market insights for copying
 * @param prices - Array of price objects
 * @param getCropNameInLanguage - Function to get crop name in current language
 * @param language - Current language
 * @returns Formatted text string
 */
export function formatMarketInsights(
    prices: any[],
    getCropNameInLanguage: (crop: string) => string,
    language: string
): string {
    let text = `${language === 'hi' ? 'मार्केट अंतर्दृष्टि' : 'Market Insights'}\n\n`;

    // Price Gainers
    text += `${language === 'hi' ? 'मूल्य वृद्धि' : 'Price Gainers'}:\n`;
    const gainers = prices
        .filter(p => p.change > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 3);
    if (gainers.length > 0) {
        gainers.forEach((price, idx) => {
            text += `${idx + 1}. ${getCropNameInLanguage(price.crop)} (${price.market}): +${price.changePercent.toFixed(2)}%\n`;
        });
    } else {
        text += `${language === 'hi' ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}\n`;
    }

    text += `\n`;

    // Price Decliners
    text += `${language === 'hi' ? 'मूल्य गिरावट' : 'Price Decliners'}:\n`;
    const decliners = prices
        .filter(p => p.change < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 3);
    if (decliners.length > 0) {
        decliners.forEach((price, idx) => {
            text += `${idx + 1}. ${getCropNameInLanguage(price.crop)} (${price.market}): ${price.changePercent.toFixed(2)}%\n`;
        });
    } else {
        text += `${language === 'hi' ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}\n`;
    }

    text += `\n`;

    // Market Tips
    text += `${language === 'hi' ? 'मार्केट सुझाव' : 'Market Tips'}:\n`;
    text += language === 'hi' ?
        '• नियमित मूल्य निगरानी करें\n• कई मार्केट की तुलना करें\n• बेचने का सही समय चुनें\n• लागत-लाभ का विश्लेषण करें' :
        '• Monitor prices regularly\n• Compare multiple markets\n• Choose the right time to sell\n• Analyze cost-benefit ratios';

    return text;
}

/**
 * Format price summary for copying
 * @param prices - Array of price objects
 * @param formatCurrency - Function to format currency
 * @param language - Current language
 * @returns Formatted text string
 */
export function formatPriceSummary(
    prices: any[],
    formatCurrency: (amount: number) => string,
    language: string
): string {
    return `${language === 'hi' ? 'मूल्य सारांश' : 'Price Summary'}

${language === 'hi' ? 'उच्चतम मूल्य' : 'Highest Price'}: ${formatCurrency(Math.max(...prices.map(p => p.price)))}
${language === 'hi' ? 'न्यूनतम मूल्य' : 'Lowest Price'}: ${formatCurrency(Math.min(...prices.map(p => p.price)))}
${language === 'hi' ? 'औसत मूल्य' : 'Average Price'}: ${formatCurrency(Math.round(prices.reduce((sum, p) => sum + p.price, 0) / prices.length) || 0)}
${language === 'hi' ? 'कुल मार्केट' : 'Total Markets'}: ${Array.from(new Set(prices.map(p => p.market))).length}`;
}