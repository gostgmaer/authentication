function getAppIdAndEntity(url) {
    // Split the URL by '?' to remove the query part
    const [pathPart] = url.split('?');
  
    // Split the remaining URL into parts using '/'
    const parts = pathPart.split('/');
  
    // Find the index of "table" in the parts array
    const tableIndex = parts.indexOf('table');
  
    // Check if "table" is found in the URL and has exactly one '/' on each side
    if (
      tableIndex !== -1 &&
      tableIndex > 0 &&
      tableIndex < parts.length - 1 &&
      parts[tableIndex - 1] && !parts[tableIndex - 1].includes('/') &&
      parts[tableIndex + 1] && !parts[tableIndex + 1].includes('/')
    ) {
      // Get the path key before "table" as "app_id"
      const appId = parts[tableIndex - 1];
  
      // Get the path key after "table" as "entity"
      const entity = parts[tableIndex + 1];
  
      return {
        app_id: appId,
        entity: entity,
      };
    } else {
      // "table" not found or doesn't have exactly one '/' on each side
      return null;
    }
  }



  module.exports = {getAppIdAndEntity};









