/**
 * Media Module
 *
 * Provides access to media files from the storefront API.
 */

export class MediaModule {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get all media files within a named folder
   * @param {string} folderName - The folder name (e.g. "gallery_01")
   * @returns {Promise<{folder: string, items: Array}>}
   *
   * @example
   * const { items } = await client.media.getFolder("gallery_01");
   * console.log(items); // [{ id, name, url, alt_text, width, height, ... }, ...]
   */
  async getFolder(folderName) {
    const url = `${this.client.baseURL}/api/storefront/media/folder/${encodeURIComponent(folderName)}`;
    return this.client._fetch(url);
  }
}

export default MediaModule;
