/**
 * OCR Parser Utility
 * Extracts structured data from OCR text for expense auto-fill
 */

export interface ParsedReceiptData {
  amount?: number
  date?: string
  description?: string
  merchantName?: string
  category?: string
  currency?: string
}

/**
 * Parse OCR data from Cloudinary's Google Vision AI
 */
export function parseOcrData(ocrData: any): ParsedReceiptData {
  if (!ocrData) {
    console.log('[OCR Parser] No OCR data provided')
    return {}
  }

  // Handle array format (Cloudinary sometimes returns array)
  if (Array.isArray(ocrData)) {
    console.log('[OCR Parser] OCR data is array, taking first element')
    ocrData = ocrData[0]
  }

  let fullText = ''
  
  // Extract full text from OCR response
  if (ocrData.textAnnotations && ocrData.textAnnotations.length > 0) {
    fullText = ocrData.textAnnotations[0].description || ''
    console.log('[OCR Parser] Extracted text from textAnnotations')
  } else if (typeof ocrData === 'string') {
    fullText = ocrData
    console.log('[OCR Parser] OCR data is string')
  } else if (ocrData.fullTextAnnotation?.text) {
    fullText = ocrData.fullTextAnnotation.text
    console.log('[OCR Parser] Extracted text from fullTextAnnotation')
  } else {
    console.log('[OCR Parser] Unknown OCR data structure:', Object.keys(ocrData))
  }

  console.log('[OCR Parser] Full text length:', fullText.length)
  console.log('[OCR Parser] Full text preview:', fullText.substring(0, 200))

  const result: ParsedReceiptData = {}

  // Extract amount (look for currency symbols and numbers)
  // Enhanced patterns to handle Indian number format (comma separators)
  const amountPatterns = [
    /(?:total|amount|sum|grand\s*total)[\s:]*₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(?:total|amount|sum|grand\s*total)[\s:]*[$€£¥]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /[$€£¥]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP|JPY|INR|CAD|AUD)/gi,
  ]

  for (const pattern of amountPatterns) {
    const matches = Array.from(fullText.matchAll(pattern))
    
    if (matches.length > 0) {
      // Take the last match (usually the total)
      const match = matches[matches.length - 1]
      const amountStr = match[1] || match[0]
      const cleanAmount = amountStr.replace(/[^0-9.,]/g, '').replace(/,/g, '')
      const amount = parseFloat(cleanAmount)
      
      console.log('[OCR Parser] Amount pattern matched:', pattern.source)
      console.log('[OCR Parser] Amount string:', amountStr, '-> cleaned:', cleanAmount, '-> parsed:', amount)
      
      if (!isNaN(amount) && amount > 0) {
        result.amount = amount
        break
      }
    }
  }

  // Extract currency
  const currencyPatterns = [
    /₹\s*\d+/i, // Rupee sign (check first for Indian invoices)
    /\b(USD|EUR|GBP|CAD|AUD|INR|JPY)\b/i,
    /[$]\s*\d+/i, // Dollar sign
    /[€]\s*\d+/i, // Euro sign
    /[£]\s*\d+/i, // Pound sign
    /[¥]\s*\d+/i, // Yen sign
  ]

  for (const pattern of currencyPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      const currencyMap: { [key: string]: string } = {
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP',
        '¥': 'JPY',
        '₹': 'INR',
      }
      
      let currency = match[1] || match[0].charAt(0) // Get currency code or symbol
      currency = currencyMap[currency] || currency.toUpperCase()
      
      console.log('[OCR Parser] Currency detected:', currency)
      
      if (['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'].includes(currency)) {
        result.currency = currency
        break
      }
    }
  }

  // Extract date (various formats)
  const datePatterns = [
    /(?:invoice\s*date|date)[\s:]*(\d{1,2}\/\d{1,2}\/\d{4})/i, // Invoice Date: DD/MM/YYYY
    /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/,
    /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/,
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i,
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i,
  ]

  for (const pattern of datePatterns) {
    const match = fullText.match(pattern)
    if (match) {
      try {
        let dateStr = match[1]
        console.log('[OCR Parser] Date string found:', dateStr)
        
        // Handle DD/MM/YYYY format
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/')
          if (parts.length === 3 && parts[0].length <= 2) {
            // Assume DD/MM/YYYY format (common in India)
            const [day, month, year] = parts
            dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            console.log('[OCR Parser] Converted DD/MM/YYYY to:', dateStr)
          }
        }
        
        const parsedDate = new Date(dateStr)
        if (!isNaN(parsedDate.getTime())) {
          // Format as YYYY-MM-DD for input field
          result.date = parsedDate.toISOString().split('T')[0]
          console.log('[OCR Parser] Date parsed successfully:', result.date)
          break
        }
      } catch (error) {
        console.log('[OCR Parser] Date parsing error:', error)
        // Continue to next pattern
      }
    }
  }

  // Extract merchant name (usually at the top of receipt)
  const lines = fullText.split('\n').filter(line => line.trim())
  if (lines.length > 0) {
    // Skip common invoice headers
    let foundMerchant = false
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim()
      console.log('[OCR Parser] Checking line', i, ':', line)
      
      // Skip these common headers
      if (line.match(/^(invoice|logo|from|bill\s*to|ship\s*to|receipt|tax|#|in-\d+)$/i)) {
        console.log('[OCR Parser] Skipped header line')
        continue
      }
      
      // Skip lines with just numbers or dates
      if (line.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/)) {
        console.log('[OCR Parser] Skipped date line')
        continue
      }
      
      // Found a potential merchant name
      if (line.length >= 3 && line.length <= 100) {
        result.merchantName = line
        console.log('[OCR Parser] Merchant name found:', line)
        foundMerchant = true
        break
      }
    }
    
    if (!foundMerchant) {
      console.log('[OCR Parser] No merchant name found in first 10 lines')
    }
  }

  // Determine category based on keywords
  const categoryKeywords = {
    'Office Supplies': /office|supply|supplies|staples|depot|stationery|paper|pen|ink|toner|design|frontend|icon|package|mouse\s*pad/i,
    'Equipment': /electronics|computer|laptop|monitor|hardware|equipment|tools/i,
    'Software': /software|subscription|saas|license|microsoft|adobe|google|aws|cloud/i,
    'Travel': /uber|lyft|taxi|cab|airline|flight|train|bus|metro|parking|toll|gas|fuel|petrol/i,
    'Meals': /restaurant|cafe|coffee|food|dining|lunch|dinner|breakfast|pizza|burger|cuisine|bar|pub|bistro/i,
    'Accommodation': /hotel|motel|inn|lodge|resort|airbnb|hostel|accommodation/i,
    'Transportation': /rental|car hire|vehicle|transport|transit/i,
    'Entertainment': /cinema|movie|theater|entertainment|tickets|concert|show|event/i,
  }

  for (const [category, pattern] of Object.entries(categoryKeywords)) {
    if (pattern.test(fullText)) {
      result.category = category
      console.log('[OCR Parser] Category detected:', category)
      break
    }
  }

  // Generate description from merchant name and category
  if (result.merchantName) {
    result.description = `${result.category ? result.category + ' - ' : ''}${result.merchantName}`
  } else if (result.category) {
    result.description = `${result.category} expense`
  }

  console.log('[OCR Parser] Final parsed result:', result)
  return result
}

/**
 * Validate and sanitize parsed data
 */
export function validateParsedData(data: ParsedReceiptData): ParsedReceiptData {
  const validated: ParsedReceiptData = {}

  // Validate amount
  if (data.amount && data.amount > 0 && data.amount < 1000000) {
    validated.amount = Math.round(data.amount * 100) / 100 // Round to 2 decimals
  }

  // Validate date
  if (data.date) {
    const date = new Date(data.date)
    const now = new Date()
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(now.getFullYear() - 5)
    
    // Accept dates from last 5 years and not in future
    if (date >= fiveYearsAgo && date <= now) {
      validated.date = data.date
    } else {
      console.log('[OCR Validator] Date rejected (outside 5-year range):', data.date)
    }
  }

  // Validate currency
  if (data.currency && ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'].includes(data.currency)) {
    validated.currency = data.currency
  }

  // Sanitize text fields
  if (data.merchantName && data.merchantName.length <= 100) {
    validated.merchantName = data.merchantName.substring(0, 100)
  }

  if (data.description && data.description.length <= 500) {
    validated.description = data.description.substring(0, 500)
  }

  if (data.category) {
    validated.category = data.category
  }

  return validated
}
