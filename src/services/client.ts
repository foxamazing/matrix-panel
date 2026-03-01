
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export const apiClient = {
  async get<T>(url: string, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'token': token } : {}),
        ...headers,
      },
      signal,
    });
    return handleResponse(res);
  },

  async post<T>(url: string, body: any, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'token': token } : {}),
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    });
    return handleResponse(res);
  },

  async postForm<T>(url: string, formData: FormData, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${url}`, {
      method: 'POST',
      headers: {
        ...(token ? { 'token': token } : {}),
        ...headers,
      },
      body: formData,
      signal,
    });
    return handleResponse(res);
  }
};

async function handleResponse(res: Response) {

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }
  const data = await res.json();
  if (data.code === 1000 || data.code === 1001) {
    const existingToken = localStorage.getItem('token');
    try {
      localStorage.removeItem('token');
      // 仅当之前存在 token 时才触发事件，防止死循环
      if (existingToken) {
        window.dispatchEvent(new Event('auth-changed'));
      }
    } catch {
    }
    throw new Error(data.msg || 'Unauthorized');
  }
  // Compatible with endpoints returning { success, data, error }.
  if (typeof data.code !== 'number' && typeof data.success === 'boolean') {
    if (!data.success) {
      throw new Error(data.error || data.msg || 'Unknown error');
    }
    return {
      code: 0,
      msg: data.message || data.msg || 'ok',
      data: data.data,
    };
  }
  if (data.code !== 0) {
    throw new Error(data.msg || 'Unknown error');
  }
  return data;
}
