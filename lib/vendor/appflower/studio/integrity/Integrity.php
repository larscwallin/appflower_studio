<?php

namespace AppFlower\Studio\Integrity;

/**
 * Integrity functionality
 *
 * @package appFlowerStudio
 * @author Sergey Startsev <startsev.sergey@gmail.com>
 */
class Integrity
{
    /**
     * Is integrity of system impaired or not
     *
     * @var boolean
     */
    private $is_impaired = false;
    
    /**
     * Messages where impaired integrity
     *
     * @var array
     */
    private $messages = array();
    
    /**
     * Fabric method creator
     *
     * @return Integrity
     * @author Sergey Startsev
     */
    static public function create()
    {
        return new self;
    }
    
    /**
     * Private constructor
     *
     * @author Sergey Startsev
     */
    private function __construct() {}
    
    /**
     * Check integrity functionality
     * 
     * @example Integrity::create()->check();
     *          Integrity::create()->check('Model', 'Widget');
     *          Integrity::create()->check(array('Model' => array('schemaChecking')), 'Widget');
     *
     * @return Integrity
     * @author Sergey Startsev
     */
    public function check()
    {
        $message = array();
        $rules = call_user_func_array('AppFlower\Studio\Integrity\Helper::getRules', func_get_args());
        
        foreach ($rules as $rule => $rule_methods) {
            $reflection = new \ReflectionClass("AppFlower\Studio\Integrity\Rule\\$rule\\$rule");
            $instance = $reflection->newInstance();
            $messages = $instance->execute($rule_methods)->getMessages();
            
            if (!empty($messages)) $this->messages[$rule] = $messages;
        }
        
        if (!empty($this->messages)) $this->is_impaired = true;
        
        return $this;
    }
    
    /**
     * Get messages 
     *
     * @return array
     * @author Sergey Startsev
     */
    public function getMessages()
    {
        return $this->messages;
    }
    
    /**
     * Checking is impaired integrity
     *
     * @return boolean
     * @author Sergey Startsev
     */
    public function isImpaired()
    {
        return (bool)$this->is_impaired;
    }
    
    /**
     * Render delegator
     *
     * @param string $type 
     * @return string
     * @author Sergey Startsev
     */
    public function render($type = Renderer\Helper::TYPE_HTML)
    {
        return Renderer\Renderer::create($this)->render($type);
    }
    
}
