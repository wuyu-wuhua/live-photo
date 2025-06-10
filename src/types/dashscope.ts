// 通义万象图像编辑功能类型
export type DashscopeImageEditFunction =
  | 'colorization' // 图像上色
  | 'control_cartoon_feature' // 垫图，当前仅支持卡通形象
  | 'description_edit' // 指令编辑，通过指令即可编辑图像
  | 'description_edit_with_mask' // 局部重绘，需要指定编辑区域
  | 'doodle' // 线稿生图
  | 'expand' // 扩图
  | 'remove_watermark' // 去文字水印
  | 'stylization_all' // 全局风格化，当前支持2种风格
  | 'stylization_local' // 局部风格化，当前支持8种风格
  | 'super_resolution'; // 图像超分

// 图像编辑请求参数
export type DashscopeImageEditRequest = {
  /**
   * 输入图像的URL地址。
   * URL 需为公网可访问地址，支持 HTTP 或 HTTPS 协议。您也可在此获取临时公网URL。
   * 图像限制：
   * 图像格式：JPG、JPEG、PNG、BMP、TIFF、WEBP。
   * 图像分辨率：图像的宽度和高度范围为[512, 4096]像素。
   * 图像大小：不超过10MB。
   * URL地址中不能包含中文字符。
   */
  base_image_url: string;
  /**
   * 图像编辑功能类型。
   * 不同功能的提示词存在差异，建议根据具体功能参考相应的技巧说明。
   */
  function: DashscopeImageEditFunction;
  /**
   * 仅当function设置为description_edit_with_mask（局部重绘）时必填，其余情况无需填写。
   * URL 需为公网可访问地址，支持 HTTP 或 HTTPS 协议。您也可在此获取临时公网URL。
   * 涂抹区域图像要求：
   * 数据格式 ：仅支持图像URL地址，不支持Base64数据。
   * 图像分辨率 ：必须与base_image_url的图像分辨率保持一致。图像宽度和高度需在[512, 4096]像素之间。
   * 图像格式 ：支持JPG、JPEG、PNG、BMP、TIFF、WEBP。
   * 图像大小 ：不超过10MB。
   * URL地址中不能包含中文字符。
   * 涂抹区域颜色要求：
   * 白色区域 ：表示需要编辑的部分，必须使用纯白色（RGB值为[255,255,255]），否则可能无法正确识别。
   * 黑色区域：表示无需改变的部分，必须使用纯黑色（RGB值为[0,0,0]），否则可能无法正确识别。
   * 数据格式 ：仅支持图像URL地址，不支持Base64数据。
   * 图像分辨率 ：必须与base_image_url的图像分辨率保持一致。图像宽度和高度需在[512, 4096]像素之间。
   * 图像格式 ：支持JPG、JPEG、PNG、BMP、TIFF、WEBP。
   * 图像大小 ：不超过10MB。
   * URL地址中不能包含中文字符。
   * 涂抹区域要求：
   * 白色区域：表示需要编辑的部分，必须使用纯白色（RGB值为[255,255,255]），否则可能无法正确识别。
   * 黑色区域：表示无需改变的部分，必须使用纯黑色（RGB值为[0,0,0]），否则可能无法正确识别
   */
  mask_image_url?: string; // 仅在使用蒙版功能时需要
  parameters?: {
    /**
     * function设置为expand（扩图）时才需填写。 图像居中，向下按比例扩展图像。默认值为1.0，取值范围[1.0, 2.0]。
     */
    bottom_scale?: number;
    /**
     * 当function设置为doodle（线稿生图）时才需填写。
     * 输入图像是否为线稿图像。
     * false：默认值，输入图像不为线稿图像。模型会先从输入图像中提取线稿，再参考提取的线稿生成新的图像。
     * true：输入图像为线稿图像。模型将直接基于输入图像生成图像，适用于涂鸦作画场景。
     */
    is_sketch?: boolean;
    /**
     * 当function设置为expand（扩图）时才需填写。 图像居中，向左按比例扩展图像。默认值为1.0，取值范围[1.0, 2.0]。
     */
    left_scale?: number;
    /**
     * 生成图片的数量。取值范围为1~4张，默认为1。
     */
    n?: number;
    /**
     * function设置为expand（扩图）时才需填写。 图像居中，向右按比例扩展图像。默认值为1.0，取值范围[1.0, 2.0]。
     */
    right_scale?: number;
    /**
     * 随机种子，用于控制模型生成内容的随机性。seed参数取值范围是[0, 2147483647]。
     */
    seed?: number;
    /**
     * 当function设置为 stylization_all（全局风格化）时填写。图像修改幅度。取值范围[0.0 1.0]，默认值为0.5。值越接近0，则越接近原图效果；值越接近1，对原图的修改幅度越大。
     * 当function设置为description_edit（指令编辑）时填写。图像修改幅度。取值范围[0.0, 1.0]，默认值为0.5。值越接近0，则越接近原图效果；值越接近1，对原图的修改幅度越大。
     */
    strength?: number;
    /**
     * function设置为expand（扩图）时才需填写。 图像居中，向上按比例扩展图像。默认值为1.0，取值范围[1.0, 2.0]。
     */
    top_scale?: number;
    /**
     * 当function设置为super_resolution（图像超分）时才需填写。
     * 图像超分的放大倍数。在放大图像的同时增强细节，提升图像分辨率，实现高清处理。
     * 取值范围为1~4，默认值为1。当upscale_factor设置为1时，仅对图像进行高清处理，不进行放大。
     */
    upscale_factor?: number;
    /**
     * 是否保留水印
     */
    watermark?: boolean;
  };
  /**
   * 提示词，用来描述生成图像中期望包含的元素和视觉特点。
   * 支持中英文，长度不超过800个字符，每个汉字/字母占一个字符，超过部分会自动截断。
   * 不同功能的提示词存在差异，建议根据具体功能参考相应的技巧说明。
   */
  prompt: string;
};

// 图像编辑响应
export type DashscopeImageEditResponse = {
  /**
   * 请求失败的错误码。请求成功时不会返回此参数，
   */
  code?: string;
  /**
   * 请求失败的详细信息。请求成功时不会返回此参数
   */
  message?: string;
  output: {
    results?: {
      url: string;
    }[];
    /**
     * 任务ID。
     */
    task_id: string;
    /**
     * 任务状态。
     * 枚举值
     * PENDING：任务排队中
     * RUNNING：任务处理中SUCCEEDED：任务执行成功
     * FAILED：任务执行失败
     * CANCELED：任务取消成功
     * UNKNOWN：任务不存在或状态未知
     */
    task_status: 'FAILED' | 'PENDING' | 'RUNNING' | 'SUCCEEDED';
  };
  /**
   * 本次请求的唯一标识，用于问题排查。
   */
  request_id: string;
};

// 任务查询响应
export type DashscopeTaskQueryResponse = {
  /**
   * 任务输出信息。
   */
  output: {
    /**
     * 请求失败的错误码。请求成功时不会返回此参数
     */
    code?: string;
    /**
     * 任务完成时间。
     */
    end_time?: string;
    /**
     * 请求失败的详细信息。请求成功时不会返回此参数，
     */
    message?: string;
    /**
     * 任务结果列表，包括图像URL、部分任务执行失败报错信息等。
     */
    results?: {
      code?: string;
      message?: string;
      url?: string;
    }[];
    /**
     * 任务执行时间。
     */
    scheduled_time?: string;
    /**
     * 任务提交时间。
     */
    submit_time: string;
    /**
     * 任务ID。
     */
    task_id: string;
    /**
     * 任务消息。
     */
    task_message?: boolean;
    /**
     * 任务结果统计。
     * TOTAL integer总的任务数。
     * SUCCEEDED integer
     * 任务状态为成功的任务数。
     * FAILED integer
     * 任务状态为失败的任务数。
     */
    task_metrics?: {
      FAILED?: number;
      SUCCEEDED?: number;
      TOTAL?: number;
    };
    /**
     * 任务状态。
     * 枚举值
     * PENDING：任务排队中
     * RUNNING：任务处理中SUCCEEDED：任务执行成功
     * FAILED：任务执行失败
     * CANCELED：任务取消成功
     * UNKNOWN：任务不存在或状态未知
     */
    task_status: 'FAILED' | 'PENDING' | 'RUNNING' | 'SUCCEEDED';
  };
  /**
   * 请求唯一标识。可用于请求明细溯源和问题排查。
   */
  request_id: string;
  /**
   * 输出信息统计。只对成功的结果计数。
   */
  usage?: {
    /**
     * 模型生成图片的数量。
     */
    image_count: number;
  };
};

export type FaceDetectRequest = {
  model: string;
  input: {
    /**
     * 需要检测的图像URL
     * 图像最小边长≥400像素，最大边长≤7000像素。
     * 格式支持：jpg、jpeg、png、bmp、webp
     */
    image_url: string;
  };
  parameters: {
    /**
     * 图像中待检测区域的长宽比，表情包只支持1:1，即头部
     */
    ratio: string;
  };
};

export type FaceDetectResponse = {
  output: {
    /**
     * 检测不通过错误码
     */
    code?: string;
    /**
     * 算法检测到的动态区域，需将该值作为表情包生成API的入参。
     * 该区域的宽高比与入参画幅一致。
     * 动态区域坐标（x1，y1，x2，y2），对应左上和右下两个点的坐标。
     */
    ext_bbox_face?: Array<number>;
    /**
     * 算法检测到的人脸区域，需将该值作为表情包生成API的入参
     * 人脸区域坐标（x1，y1，x2，y2），对应左上和右下两个点的坐标
     */
    bbox_face?: Array<number>;
    /**
     * 检测不通过错误消息
     */
    message?: string;
    /**
     * 本次请求检测的图像数量，单位：张
     */
    image_count?: number;
  };
  usage?: {
    image_count: number;
  };
  request_id: string;
};

/**
 * 表情包视频生成API请求参数
 */
export type EmojiVideoRequest = {
  /**
   * 调用的模型，固定为emoji-v1
   */
  model: string;
  /**
   * 输入参数
   */
  input: {
    /**
     * 用户上传的图片URL，该图应先通过表情包人脸检测接口
     * 最终用于表情包生成的图片会按ext_bbox所指定的区域进行裁剪
     * 图像最小边长≥400像素，最大边长≤7000像素
     * 格式支持：jpg、jpeg、png、bmp、webp
     */
    image_url: string;
    /**
     * 预置的模板id，参考文档中的「表情包模板id」
     */
    driven_id: string;
    /**
     * 图片中人脸区域，应输入表情包人脸检测接口出参中同名字段的值
     */
    face_bbox: Array<number>;
    /**
     * 图片中动态区域，应输入表情包人脸检测接口出参中同名字段的值
     * 该区域的宽高比应为1:1
     */
    ext_bbox: Array<number>;
  };
};

/**
 * 表情包视频生成任务提交响应
 */
export type EmojiVideoResponse = {
  /**
   * 输出结果
   */
  output: {
    /**
     * 提交异步任务的作业id，实际作业结果需要通过异步任务查询接口获取
     */
    task_id: string;
    /**
     * 提交异步任务后的作业状态
     */
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  };
  /**
   * 本次请求的唯一id
   */
  request_id: string;
};

/**
 * 表情包视频任务查询结果
 */
export type EmojiVideoTaskResult = {
  /**
   * 请求唯一标识
   */
  request_id: string;
  /**
   * 输出信息
   */
  output: {
    /**
     * 查询作业的task_id
     */
    task_id: string;
    /**
     * 任务状态
     */
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    /**
     * 任务提交时间
     */
    submit_time?: string;
    /**
     * 任务执行时间
     */
    scheduled_time?: string;
    /**
     * 任务完成时间
     */
    end_time?: string;
    /**
     * 错误码（仅失败时有）
     */
    code?: string;
    /**
     * 错误信息（仅失败时有）
     */
    message?: string;
    /**
     * 结果信息（仅成功时有）
     */
    result?: {
      /**
       * 生成的视频URL
       */
      video_url: string;
    };
  };
  /**
   * 使用统计（仅成功时有）
   */
  usage?: {
    /**
     * 视频时长（秒）
     */
    video_duration: number;
    /**
     * 视频比例
     */
    video_ratio: string;
  };
};

/**
 * VideoRetalk API模型类型
 */
export type VideoRetalkModel = 'videoretalk';

/**
 * VideoRetalk视频口型替换API请求参数
 */
export type VideoRetalkRequest = {
  /**
   * 调用的模型，固定为videoretalk
   */
  model: VideoRetalkModel;
  /**
   * 输入参数
   */
  input: {
    /**
     * 用户上传的视频文件URL
     * 视频文件要求：
     * - 大小：文件≤300MB
     * - 格式：mp4、avi、mov
     * - 时长：2秒＜时长＜120秒
     * - 帧率：15fps≤帧率≤60fps
     * - 编码：推荐采用H.264或H.265编码
     * - 边长：640≤边长≤2048
     * - 内容：人物正面出镜的近景画面，避免大角度侧脸或人脸过小
     */
    video_url: string;
    /**
     * 用户上传的音频文件URL
     * 音频文件要求：
     * - 大小：文件≤30MB
     * - 格式：wav、mp3、aac
     * - 时长：2秒＜时长＜120秒
     * - 内容：音频中需包含清晰、响亮的人声语音，并去除了环境噪音、背景音乐等声音干扰信息
     */
    audio_url: string;
    /**
     * 用户上传的人脸参考图URL
     * 当输入视频中存在多张人脸时，可以通过该参数指定用于口型匹配的人脸
     * 如果视频中仅有一张人脸，则无需进行指定
     * 若不输入人脸参考图，默认将选择视频中第一个有人脸的画面中，人脸占比最大的人物为目标
     * 图像文件要求：
     * - 内容：需包含一张清晰的人物正脸，且为视频中出现的人物
     * - 文件大小：文件≤10MB
     * - 图像大小：长宽比小于等于2，最大边长小于等4096
     * - 格式：jpeg、jpg、png、bmp、webp
     */
    ref_image_url?: string;
  };
  /**
   * 可选参数
   */
  parameters?: {
    /**
     * 当输入的音频时长大于视频时长时，是否扩展视频长度
     * 默认值为false，可设置为true或false
     * 值为true时，使用原视频画面"倒放-正放"交替模式扩展视频时长，直至与音频相同
     * 值为false时，不扩展画面长度，生成视频时长将与原视频相同，音频将被截断
     */
    video_extension?: boolean;
  };
};

/**
 * VideoRetalk视频口型替换API响应
 */
export type VideoRetalkResponse = {
  /**
   * 输出结果
   */
  output: {
    /**
     * 提交异步任务的作业ID，实际作业结果需要通过异步任务查询接口获取
     */
    task_id: string;
    /**
     * 提交异步任务后的作业状态
     */
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    /**
     * 错误码（失败时有）
     */
    code?: string;
    /**
     * 错误信息（失败时有）
     */
    message?: string;
  };
  /**
   * 本次请求的系统唯一码
   */
  request_id: string;
};

/**
 * VideoRetalk任务查询结果
 */
export type VideoRetalkTaskResult = {
  /**
   * 请求唯一标识
   */
  request_id: string;
  /**
   * 输出信息
   */
  output: {
    /**
     * 查询作业的task_id
     */
    task_id: string;
    /**
     * 任务状态
     */
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    /**
     * 任务提交时间
     */
    submit_time?: string;
    /**
     * 任务执行时间
     */
    scheduled_time?: string;
    /**
     * 任务完成时间
     */
    end_time?: string;
    /**
     * 错误码（仅失败时有）
     */
    code?: string;
    /**
     * 错误信息（仅失败时有）
     */
    message?: string;
    /**
     * 结果信息（仅成功时有）
     */
    result?: {
      /**
       * 生成的视频URL
       */
      video_url: string;
    };
  };
  /**
   * 使用统计（仅成功时有）
   */
  usage?: {
    /**
     * 视频时长（秒）
     */
    video_duration: number;
    /**
     * 视频比例
     */
    video_ratio: string;
  };
};

/**
 * LivePortrait图像检测API模型类型
 */
export type LivePortraitDetectModel = 'liveportrait-detect';

/**
 * LivePortrait图像检测API请求参数
 */
export type LivePortraitDetectRequest = {
  /**
   * 调用的模型，固定为liveportrait-detect
   */
  model: LivePortraitDetectModel;
  /**
   * 输入参数
   */
  input: {
    /**
     * 需要检查的图像URL
     * 图像文件<10M，宽高比≤2，最大边长≤4096
     * 格式支持：jpeg、jpg、png、bmp、webp
     */
    image_url: string;
  };
};

/**
 * LivePortrait图像检测API响应
 */
export type LivePortraitDetectResponse = {
  /**
   * 输出结果
   */
  output: {
    /**
     * 所提交图像对应的检查结果
     */
    pass: boolean;
    /**
     * 所提交图像对应的检查结果信息
     */
    message: string;
  };
  /**
   * 使用统计
   */
  usage?: {
    /**
     * 本次请求检测的图像数量，单位：张
     */
    image_count: number;
  };
  /**
   * 本次请求的系统唯一码
   */
  request_id: string;
};
